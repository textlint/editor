import { LintEngineAPI } from "textchecker-element";
import browser from "webextension-polyfill";
import { TextlintResult } from "@textlint/types";
import { createEndpoint } from "../../comlink-extension/src";
import * as Comlink from "comlink";
import type { BackgroundToContentObject } from "./background";
import { scriptWorkerSet } from "./contentScript/scriptWorkerSet";
import { createTextlintWorker } from "./contentScript/textlint";
import { nonRandomKey } from "./shared/page-contents-shared";
import { logger } from "./utils/logger";
import { keyOfScript, type Script } from "./utils/script";

const rawPort = browser.runtime.connect();
// content-script <-> background page
const port = Comlink.wrap<BackgroundToContentObject>(createEndpoint(rawPort));
rawPort.onMessage.addListener((event) => {
    if (event === "textlint-editor-boot") {
        logger.log("[ContentScript]", "boot event received");
        // Inject page-script
        try {
            const script = browser.runtime.getURL("scripts/pageScript.js");
            const pageScript = document.createElement("script");
            pageScript.src = script;
            document.body.append(pageScript);
        } catch (error) {
            logger.error(error);
        }
    }
});
// release after close connection
let scripts: Script[] = [];
// page-script <-> content-script
window.addEventListener("message", async (event) => {
    if (
        event.source == window &&
        event.data &&
        event.data.direction == "from-page-script" &&
        event.data.nonRandomKey === nonRandomKey
    ) {
        const getWorker = (script: Script) => {
            const runningWorker = scriptWorkerSet.get(script);
            if (runningWorker) {
                return {
                    worker: runningWorker,
                    ext: script.ext
                };
            }
            logger.log("Start worker", keyOfScript(script));
            const textlintWorker = createTextlintWorker(script);
            scriptWorkerSet.set({ script, worker: textlintWorker });
            return {
                worker: textlintWorker,
                ext: script.ext
            };
        };
        scripts = await port.getScripts();
        // get script workers which are ready to work
        const readyScriptWorkers = async () => {
            const scriptWorkers = scripts.map((script) => {
                return getWorker(script);
            });
            await Promise.all(scriptWorkers.map((worker) => worker.worker.ready()));
            return scriptWorkers;
        };
        const lintEngine: LintEngineAPI = {
            async lintText({ text }: { text: string }): Promise<TextlintResult[]> {
                logger.log("text:", text);
                const scriptWorkers = await readyScriptWorkers();
                const allLintResults = await Promise.all(
                    scriptWorkers.map(({ worker, ext }) => {
                        return worker.createLintEngine({ ext }).lintText({ text });
                    })
                );
                logger.log("lintText", allLintResults);
                return allLintResults.flat();
            },
            async fixText({ text }): Promise<{ output: string }> {
                let output = text;
                const scriptWorkers = await readyScriptWorkers();
                for (const { worker, ext } of scriptWorkers) {
                    await worker
                        .createLintEngine({ ext })
                        .fixText({ text: output, messages: [] })
                        .then((result: { output: string }) => {
                            output = result.output;
                            return result;
                        });
                }
                return {
                    output
                };
            },
            ignoreText: port.ignoreText
        };
        const command = event.data.command as keyof typeof lintEngine;
        const args = event.data.args;
        const lintEngineCommand = lintEngine[command];
        if (Object.prototype.hasOwnProperty.call(lintEngine, command) && typeof lintEngineCommand === "function") {
            const newVar: Promise<any> = lintEngineCommand(args);
            newVar.then((result) => {
                window.postMessage(
                    {
                        command: command + "::response",
                        direction: "from-content-script",
                        result
                    },
                    window.location.origin
                );
            });
        }
    }
});
const closeScriptWorkers = () => {
    scripts.forEach((script) => {
        const deleted = scriptWorkerSet.delete({ script });
        if (deleted) {
            logger.log("Success to delete worker", keyOfScript(script));
        } else {
            logger.log("Fail to delete worker", keyOfScript(script));
        }
    });
};
rawPort.onDisconnect.addListener(async () => {
    logger.log("dispose worker - close workers");
    // When some tab close, the related worker will disposed.
    // It aims to reduce memory leak
    // https://github.com/textlint/editor/issues/52
    // scriptWorker will re-start when call `lint` or `fix` api automatically
    closeScriptWorkers();
    // Release reference - force GC
    scripts = [];
});
