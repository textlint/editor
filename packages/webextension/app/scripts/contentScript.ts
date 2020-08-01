// @ts-ignore - replace webcomponent to shim
import "@webcomponents/custom-elements";
import { browser } from "webextension-polyfill-ts";
import { attachToTextArea } from "textchecker-element";
import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));
const targetElement = document.querySelectorAll("textarea");
targetElement.forEach((element) =>
    attachToTextArea({
        textAreaElement: element,
        lintText: port.lintText,
        fixText: port.fixText,
        lintingDebounceMs: 200
    })
);
