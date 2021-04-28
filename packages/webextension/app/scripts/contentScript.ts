import { LintEngineAPI } from "textchecker-element";
import { browser } from "webextension-polyfill-ts";
import { nonRandomKey } from "./shared/page-contents-shared";
import { logger } from "./utils/logger";
import type { Script } from "./background/database";
import { createTextlintWorker } from "./background/textlint";
import type { TextlintResult } from "@textlint/types";
import { BackgroundToContentEvents } from "./background";

const rawPort = browser.runtime.connect();
// content-script <-> background page
// const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(rawPort));
const createLintEngine = async (scripts: Script[]) => {
    const scriptWorkers = scripts.map((script) => {
        // TODO: comment support for textlintrc
        const textlintWorker = createTextlintWorker(script);
        return {
            worker: textlintWorker,
            ext: script.ext
        };
    });
    await Promise.all(scriptWorkers.map(({ worker }) => worker.ready()));
    const lintEngine: LintEngineAPI = {
        async lintText({ text }: { text: string }): Promise<TextlintResult[]> {
            logger.log("text:", text);
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
            for (const { worker, ext } of scriptWorkers) {
                await worker
                    .createLintEngine({ ext })
                    .fixText({ text: output, messages: [] })
                    .then((result) => {
                        output = result.output;
                        return result;
                    });
            }
            return {
                output
            };
        },
        async ignoreText(): Promise<boolean> {
            throw new Error("No implement ignoreText on background");
        }
    };
    return lintEngine;
};

let lintEngine: LintEngineAPI | null = null;
rawPort.onMessage.addListener(async (event: BackgroundToContentEvents) => {
    if (event.type === "textlint-editor-boot") {
        logger.log("[ContentScript]", "boot event received", event.scripts);
        lintEngine = await createLintEngine(event.scripts);
        logger.log("[ContentScript]", "created LingEngine", lintEngine);
        // Inject page-script
        try {
            const script = browser.extension.getURL("scripts/pageScript.js");
            const pageScript = document.createElement("script");
            pageScript.src = script;
            document.body.append(pageScript);
        } catch (error) {
            logger.error(error);
        }
    }
});

// page-script <-> content-script
window.addEventListener("message", (event) => {
    if (
        event.source == window &&
        event.data &&
        event.data.direction == "from-page-script" &&
        event.data.nonRandomKey === nonRandomKey
    ) {
        if (!lintEngine) {
            throw new Error("No ready lintEngine");
        }
        const command = event.data.command as keyof typeof lintEngine;
        const args = event.data.args;
        const lintEngineElement = lintEngine[command];
        if (Object.prototype.hasOwnProperty.call(lintEngine, command) && typeof lintEngineElement === "function") {
            const lintCommendResult: Promise<any> = lintEngineElement(args);
            lintCommendResult.then((result) => {
                window.postMessage(
                    {
                        command: command + "::response",
                        direction: "from-content-script",
                        result
                    },
                    "*"
                );
            });
        }
    }
});
