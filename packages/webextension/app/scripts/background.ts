import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintWorker } from "./background/textlint";
import { openDatabase } from "./background/database";
import { LintEngineAPI } from "textchecker-element";
import { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";

browser.runtime.onInstalled.addListener((details) => {
    console.log("previousVersion", details.previousVersion);
});

browser.tabs.onUpdated.addListener(async (tabId) => {
    browser.pageAction.show(tabId);
});

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
        console.log("details", details);
        if (details.method != "GET") return {};
        if (!responseHasUserScriptType(details.responseHeaders)) return {};

        openInstallDialog(details.url);
        // https://stackoverflow.com/a/18684302
        return { redirectUrl: "javascript:" };
    },
    { urls: ["*://*/*textlint.js"], types: ["main_frame"] },
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
const workingWorkerSet = new Set<ReturnType<typeof createTextlintWorker>>();
const closeAllWorker = () => {
    workingWorkerSet.forEach((worker) => {
        worker.dispose();
    });
};
browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    closeAllWorker();
    const db = await openDatabase();
    const originUrl = port.sender?.url;
    console.log("[background] originUrl", originUrl);
    if (originUrl && /^chrome-extension:\/\/.*\/(edit-script.html|popup.html)/.test(originUrl)) {
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
    const scripts = originUrl ? await db.findScriptsWithPatten(originUrl) : [];
    const workers = scripts.map((script) => {
        const blob = new Blob([script.code], { type: "application/javascript" });
        // TODO: comment support for textlintrc
        const textlintWorker = createTextlintWorker(URL.createObjectURL(blob), JSON.parse(script.textlintrc));
        workingWorkerSet.add(textlintWorker);
        return textlintWorker;
    });
    console.log("[Background] workers started", workers);
    // Support multiple workers
    const ext = ".md";
    const lintEngine: LintEngineAPI = {
        async lintText({ text }: { text: string }): Promise<TextlintResult[]> {
            console.log("[Background] text:", text);
            const allLintResults = await Promise.all(
                workers.map((worker) => {
                    return worker.createLintEngine({ ext }).lintText({ text });
                })
            );
            console.log("[Background]", allLintResults);
            return allLintResults.flat();
        },
        async fixText({ text, message }): Promise<{ output: string }> {
            if (!message.fix || !message.fix.range) {
                return { output: text };
            }
            // replace fix.range[0, 1] with fix.text
            return {
                output: text.slice(0, message.fix.range[0]) + message.fix.text + text.slice(message.fix.range[1])
            };
        },
        async fixAll({ text }: { text: string }): Promise<TextlintFixResult> {
            let output = text;
            return workers.reduce((promise, worker) => {
                return promise.then(() => {
                    return worker
                        .createLintEngine({ ext })
                        .fixAll({ text: output })
                        .then((result) => {
                            output = result.output;
                            return result;
                        });
                });
            }, (Promise.resolve() as any) as Promise<TextlintFixResult>);
        },
        fixRule({ text, message }: { text: string; message: TextlintMessage }): Promise<TextlintFixResult> {
            let output = text;
            return workers.reduce((promise, worker) => {
                return promise.then(() => {
                    return worker
                        .createLintEngine({ ext })
                        .fixRule({ text: output, message })
                        .then((result) => {
                            output = result.output;
                            return result;
                        });
                });
            }, (Promise.resolve() as any) as Promise<TextlintFixResult>);
        }
    };
    const backgroundExposedObject: backgroundExposedObject = {
        ...lintEngine,
        addScript: (script) => {
            return db.addScript(script);
        }
    };
    port.onDisconnect.addListener(() => {
        console.log("[Background] dispose worker");
        closeAllWorker();
    });
    console.log("[Background] content port", port);
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
    await Promise.all(workers.map((worker) => worker.ready()));
    port.postMessage("textlint-editor-boot");
});
