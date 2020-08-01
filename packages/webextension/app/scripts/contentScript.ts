// @ts-ignore - replace webcomponent to shim
import "@webcomponents/custom-elements";
import { browser } from "webextension-polyfill-ts";
import { attachToTextArea } from "textchecker-element";
import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));
const targetElement = document.querySelectorAll("textarea");
targetElement.forEach((element) => {
    const extOfTextarea = ".md";
    return attachToTextArea({
        textAreaElement: element,
        lintText: (args) => port.lintText({ ...args, ext: extOfTextarea }),
        fixText: (args) => port.fixText({ ...args, ext: extOfTextarea }),
        lintingDebounceMs: 200
    });
});
