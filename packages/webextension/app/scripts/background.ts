import browser from "webextension-polyfill";
import { createBackgroundEndpoint, isMessagePort } from "../../comlink-extension/src";
import * as Comlink from "comlink";
import { openDatabase } from "./background/database";
import { Script } from "./utils/script";
import { LintEngineAPI } from "textchecker-element";
import { TextlintResult } from "@textlint/types";
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
export type BackgroundToContentObject = LintEngineAPI & {
    // Get scripts
    getScripts(): Promise<Script[]>;
};
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
    // Support multiple workers
    const lintEngine: BackgroundToContentObject = {
        async lintText(): Promise<TextlintResult[]> {
            throw new Error("No implement lintText on background");
        },
        async fixText(): Promise<{ output: string }> {
            throw new Error("No implement fixText on background");
        },
        async ignoreText(): Promise<boolean> {
            throw new Error("No implement ignoreText on background");
        },
        async getScripts(): Promise<Script[]> {
            return await db.findScriptsWithPatten(originUrl);
        }
    };
    Comlink.expose(lintEngine, createBackgroundEndpoint(port));
    port.postMessage("textlint-editor-boot");
});
