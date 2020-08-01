import { browser } from "webextension-polyfill-ts";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";
import { createTextlintPage } from "./background/textlint";

browser.runtime.onInstalled.addListener((details) => {
    console.log("previousVersion", details.previousVersion);
});

browser.tabs.onUpdated.addListener(async (tabId) => {
    browser.pageAction.show(tabId);
});

const textlint = createTextlintPage();
// receive
const backgroundExposedObject = {
    lintText: textlint.lintText,
    fixText: textlint.fixText
};
export type backgroundExposedObject = typeof backgroundExposedObject;
browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    await textlint.ready();
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
});
