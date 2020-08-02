import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintWorker } from "./background/textlint";
import { openDatabase } from "./background/openDatabase";

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
    lintText: ReturnType<typeof createTextlintWorker>["lintText"];
    fixText: ReturnType<typeof createTextlintWorker>["fixText"];
    addScript: ThenArg<DataBase>["addScript"];
};
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
    // TODO multiple worker?
    const lintText:ReturnType<typeof createTextlintWorker>["lintText"] = ()
    const backgroundExposedObject: backgroundExposedObject = {
        lintText: textlint.lintText,
        fixText: textlint.fixText,
        addScript: (script) => {
            return db.addScript(script);
        }
    };
    port.onDisconnect.addListener(() => {
        console.log("dispose worker");
        workers.forEach((worker) => {
            worker.dispose();
        });
    });
    console.log(port.sender);
    await Promise.all(workers.map((worker) => worker.ready()));
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
});
