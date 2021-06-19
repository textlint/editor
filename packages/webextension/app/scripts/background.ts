import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintWorker } from "./background/textlint";
import { keyOfScript, openDatabase, Script } from "./background/database";
import { LintEngineAPI } from "textchecker-element";
import { TextlintResult } from "@textlint/types";
import { scriptWorkerSet } from "./background/scriptWorkerSet";
import { logger } from "./utils/logger";
import { listenOnTextlintWorkerJsUrl } from "./background/onTextlintWorker";

async function openInstallDialog({ tabId, url }: { tabId: number; url: string }) {
    const installUrl = browser.runtime.getURL("/pages/install-dialog.html") + "?script=" + encodeURIComponent(url);
    await browser.tabs.update(tabId, {
        url: installUrl
    });
}

// https://**/*textlint-worker.js
listenOnTextlintWorkerJsUrl({
    onTextlintWorkerUrl({ tabId, url }) {
        return openInstallDialog({ tabId, url });
    }
});

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type DataBase = ThenArg<ReturnType<typeof openDatabase>>;
export type BackgroundToContentObject = LintEngineAPI;
export type BackgroundToPopupObject = {
    findScriptsWithPatten: DataBase["findScriptsWithPatten"];
    findScriptsWithName: DataBase["findScriptsWithName"];
    deleteScript: DataBase["deleteScript"];
    updateScript: DataBase["updateScript"];
    addScript: DataBase["addScript"];
    openEditor: (options: { name: string; namespace: string }) => void;
};

browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    const db = await openDatabase();
    const originUrl = port.sender?.url;
    logger.log("originUrl", originUrl);
    if (!originUrl) {
        return;
    }

    const isExtensionPage = (urlString: string) => {
        try {
            // Note: browser.runtime.id is not uuid in Firefox
            const extensionPageUrl = new URL(browser.runtime.getURL("/pages/edit-script.html"));
            const currentUrl = new URL(urlString);
            if (currentUrl.protocol !== extensionPageUrl.protocol) {
                return false;
            }
            if (currentUrl.host !== extensionPageUrl.host) {
                return false;
            }
            return currentUrl.pathname.startsWith(`/pages/`);
        } catch {
            return false;
        }
    };
    if (isExtensionPage(originUrl)) {
        const exports: BackgroundToPopupObject = {
            findScriptsWithPatten: db.findScriptsWithPatten,
            findScriptsWithName: db.findScriptsWithName,
            deleteScript: db.deleteScript,
            updateScript: db.updateScript,
            addScript: db.addScript,
            openEditor: (options: { name: string; namespace: string }) => {
                const editPageUrl = browser.runtime.getURL("/pages/edit-script.html");
                browser.tabs.create({
                    url: `${editPageUrl}?name=${encodeURIComponent(options.name)}&namespace=${encodeURIComponent(
                        options.namespace
                    )}`
                });
            }
        };
        return Comlink.expose(exports, createBackgroundEndpoint(port));
    }
    const scripts = await db.findScriptsWithPatten(originUrl);
    logger.log("scripts", scripts);
    const getWorker = (script: Script) => {
        const runningWorker = scriptWorkerSet.get(script);
        if (runningWorker) {
            return {
                worker: runningWorker,
                ext: script.ext
            };
        }
        logger.log("start worker", keyOfScript(script));
        const textlintWorker = createTextlintWorker(script);
        scriptWorkerSet.add({ script, worker: textlintWorker });
        return {
            worker: textlintWorker,
            ext: script.ext
        };
    };
    // get script workers which are ready to work
    const readyScriptWorkers = async () => {
        const scriptWorkers = scripts.map((script) => {
            return getWorker(script);
        });
        await Promise.all(scriptWorkers.map((worker) => worker.worker.ready()));
        return scriptWorkers;
    };
    const closeScriptWorkers = () => {
        scripts.forEach((script) => {
            logger.log("delete worker", keyOfScript(script));
            return scriptWorkerSet.delete({ script });
        });
    };
    // Support multiple workers
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
    port.onDisconnect.addListener(async () => {
        logger.log("dispose worker - close workers");
        // When some tab close, the related worker will disposed.
        // It aims to reduce memory leak
        // https://github.com/textlint/editor/issues/52
        // scriptWorker will re-start when call `lint` or `fix` api automatically
        closeScriptWorkers();
    });
    const backgroundExposedObject: BackgroundToContentObject = lintEngine;
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
    port.postMessage("textlint-editor-boot");
});
