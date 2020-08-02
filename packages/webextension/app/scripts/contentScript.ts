// @ts-ignore - replace webcomponent to shim
import "@webcomponents/custom-elements";
import { browser } from "webextension-polyfill-ts";
import { attachToTextArea, LintEngineAPI } from "textchecker-element";
import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));
const targetElement = document.querySelectorAll("textarea");

async function contentScriptMain() {
    const lintEngine: LintEngineAPI = {
        lintText: port.lintText,
        fixText: port.fixText,
        fixAll: port.fixAll,
        fixRule: port.fixRule
    };
    console.log("[ContentScript]", lintEngine);
    targetElement.forEach((element) => {
        return attachToTextArea({
            textAreaElement: element,
            lintingDebounceMs: 200,
            lintEngine: lintEngine
        });
    });
}

console.log("[ContentScript]", "main");
contentScriptMain().catch((error) => {
    console.error("[texlint editor ContentScriptError]", error);
});
