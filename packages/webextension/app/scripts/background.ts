import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { openDatabase, Script } from "./background/database";
import { logger } from "./utils/logger";

// browser.runtime.onInstalled.addListener((details) => {
//     // logger.log("previousVersion", details.previousVersion);
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
    await browser.tabs.create({
        url: installUrl
    });
}

browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (details.method !== "GET") return {};
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
export type BackgroundPopupObject = {
    findScriptsWithPatten: DataBase["findScriptsWithPatten"];
    findScriptsWithName: DataBase["findScriptsWithName"];
    deleteScript: DataBase["deleteScript"];
    updateScript: DataBase["updateScript"];
    addScript: DataBase["addScript"];
    openEditor: (options: { name: string; namespace: string }) => void;
};

// Background → Content Script events
export type BackgroundToContentEventBoot = {
    type: "textlint-editor-boot";
    scripts: Script[];
};
export type BackgroundToContentEvents = BackgroundToContentEventBoot;
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
    // internal page
    if (/^(moz|chrome)-extension:\/\/.*\/(install-dialog.html|edit-script.html|popup.html)/.test(originUrl)) {
        const exports: BackgroundPopupObject = {
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
    // website
    const scripts = await db.findScriptsWithPatten(originUrl);
    logger.log("scripts", scripts);
    port.postMessage({
        type: "textlint-editor-boot",
        scripts
    });
});
