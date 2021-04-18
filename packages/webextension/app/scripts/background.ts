import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintWorker } from "./background/textlint";
import { openDatabase } from "./background/database";
import { LintEngineAPI } from "textchecker-element";
import { TextlintResult } from "@textlint/types";
import { scriptWorkerSet } from "./background/scriptWorkerSet";

// browser.runtime.onInstalled.addListener((details) => {
//     // console.log("previousVersion", details.previousVersion);
// });
//
// browser.tabs.onUpdated.addListener(async (tabId) => {
//     // await browser?.pageAction?.show(tabId);
// });

const gContentTypeRe = (() => {
    const userScriptTypes = [
        "text/plain",
        "application/ecmascript",
        "application/javascript",
        "application/x-javascript",
        "text/ecmascript",
        "text/javascript"
    ];
    return new RegExp(`^(${userScriptTypes.join("|")})\\b`);
})();

function responseHasUserScriptType(responseHeaders: any) {
    for (let header of responseHeaders) {
        let headerName = header.name.toLowerCase();
        if ("content-type" === headerName && gContentTypeRe.test(header.value)) {
            return true;
        }
    }
    return false;
}

async function openInstallDialog(url: string) {
    const installUrl = browser.runtime.getURL("/pages/install-dialog.html") + "?script=" + encodeURIComponent(url);
    const options = {
        height: 800,
        type: "popup",
        url: installUrl,
        width: 800
    } as const;
    await browser.windows.create(options);
}

browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (details.method != "GET") return {};
        if (!responseHasUserScriptType(details.responseHeaders)) return {};
        openInstallDialog(details.url);
        // https://stackoverflow.com/a/18684302
        return { redirectUrl: "javascript:" };
    },
    { urls: ["*://*/*textlint-worker.js"], types: ["main_frame"] },
    ["blocking", "responseHeaders"]
);
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type DataBase = ThenArg<ReturnType<typeof openDatabase>>;
export type backgroundExposedObject = {
    addScript: DataBase["addScript"];
} & LintEngineAPI;
export type backgroundPopupObject = {
    findScriptsWithPatten: DataBase["findScriptsWithPatten"];
    findScriptsWithName: DataBase["findScriptsWithName"];
    deleteScript: DataBase["deleteScript"];
    updateScript: DataBase["updateScript"];
    openEditor: (options: { name: string; namespace: string }) => void;
};

browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    const db = await openDatabase();
    const originUrl = port.sender?.url;
    console.log("[background] originUrl", originUrl);
    if (!originUrl) {
        return;
    }
    if (/^(moz|chrome)-extension:\/\/.*\/(edit-script.html|popup.html)/.test(originUrl)) {
        const exports: backgroundPopupObject = {
            findScriptsWithPatten: db.findScriptsWithPatten,
            findScriptsWithName: db.findScriptsWithName,
            deleteScript: db.deleteScript,
            updateScript: db.updateScript,
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
    console.log("scripts", scripts);
    const scriptWorkers = scripts.map((script) => {
        const runningWorker = scriptWorkerSet.get(script);
        if (runningWorker) {
            return {
                worker: runningWorker,
                ext: script.ext
            };
        }
        // TODO: comment support for textlintrc
        const textlintWorker = createTextlintWorker(script);
        scriptWorkerSet.add({ script, worker: textlintWorker, url: originUrl });
        return {
            worker: textlintWorker,
            ext: script.ext
        };
    });
    console.log("[Background] workers started", scriptWorkers);
    // Support multiple workers
    const lintEngine: LintEngineAPI = {
        async lintText({ text }: { text: string }): Promise<TextlintResult[]> {
            console.log("[Background] text:", text);
            const allLintResults = await Promise.all(
                scriptWorkers.map(({ worker, ext }) => {
                    return worker.createLintEngine({ ext }).lintText({ text });
                })
            );
            console.log("[Background] lintText", allLintResults);
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
    const backgroundExposedObject: backgroundExposedObject = {
        ...lintEngine,
        addScript: (script) => {
            return db.addScript(script);
        }
    };
    port.onDisconnect.addListener(async () => {
        console.log("[Background] dispose worker");
        const scripts = await db.findScriptsWithPatten(originUrl);
        scripts.forEach((script) => {
            scriptWorkerSet.delete({ script: script, url: originUrl });
        });
    });
    console.log("[Background] content port", port);
    scriptWorkerSet.dump();
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
    await Promise.all(scriptWorkers.map(({ worker }) => worker.ready()));
    port.postMessage("textlint-editor-boot");
});
