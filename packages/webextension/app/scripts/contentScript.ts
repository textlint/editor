// Load webcomponents polyfill for Chrome Extension
if (window.customElements === null || window.customElements === undefined) {
    require("@webcomponents/custom-elements");
}
import { browser } from "webextension-polyfill-ts";
import { attachToTextArea, LintEngineAPI } from "textchecker-element";
import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";

const rawPort = browser.runtime.connect();
const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(rawPort));
const targetElement = document.querySelectorAll("textarea");

async function contentScriptMain() {
    const lintEngine: LintEngineAPI = {
        lintText: port.lintText,
        fixText: port.fixText,
        fixAll: port.fixAll,
        fixRule: port.fixRule
    };
    targetElement.forEach((element) => {
        return attachToTextArea({
            textAreaElement: element,
            lintingDebounceMs: 200,
            lintEngine: lintEngine
        });
    });
}

console.log("[ContentScript]", "main loaded");
rawPort.onMessage.addListener((event) => {
    if (event === "textlint-editor-boot") {
        console.log("[ContentScript]", "boot event received");
        contentScriptMain().catch((error) => {
            console.error("[texlint editor ContentScriptError]", error);
        });
    }
});
