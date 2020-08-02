import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintWorker } from "./background/textlint";
import { openDatabase } from "./background/openDatabase";
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
        height: 640,
        type: "popup",
        url: installUrl,
        width: 480
    } as const;
    const window = await browser.windows.create(options);
    console.log("window", window);
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
    { urls: ["*://*/*/textlint.js"], types: ["main_frame"] },
    ["blocking", "responseHeaders"]
);
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type DataBase = ReturnType<typeof openDatabase>;
export type backgroundExposedObject = {
    addScript: ThenArg<DataBase>["addScript"];
} & LintEngineAPI;
browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    const db = await openDatabase();
    const originUrl = port.sender?.url;
    const scripts = originUrl ? await db.findScriptsWithPatten(originUrl) : [];
    const workers = scripts.map((script) => {
        const blob = new Blob([script.code], { type: "application/javascript" });
        return createTextlintWorker(URL.createObjectURL(blob));
    });
    console.log("[Background] workers", workers);
    // Support multiple workers
    const ext = ".md";
    const lintEngine: LintEngineAPI = {
        async lintText({ text }: { text: string }): Promise<TextlintResult[]> {
            console.log("[Background] text", text);
            const allLintResults = await Promise.all(
                workers.map((worker) => {
                    return worker.createLintEngine({ ext }).lintText({ text });
                })
            );
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
            return workers.slice(1).reduce((promise, worker) => {
                return promise.then(() => {
                    return worker.createLintEngine({ ext }).fixAll({ text });
                });
            }, workers[0].createLintEngine({ ext }).fixAll({ text }));
        },
        fixRule({ text, message }: { text: string; message: TextlintMessage }): Promise<TextlintFixResult> {
            return workers.slice(1).reduce((promise, worker) => {
                return promise.then(() => {
                    return worker.createLintEngine({ ext }).fixRule({ text, message });
                });
            }, workers[0].createLintEngine({ ext }).fixRule({ text, message }));
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
        workers.forEach((worker) => {
            worker.dispose();
        });
    });
    console.log("[Background] content port", port);
    await Promise.all(workers.map((worker) => worker.ready()));
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
});
