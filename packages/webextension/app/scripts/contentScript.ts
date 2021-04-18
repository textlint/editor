import { LintEngineAPI } from "textchecker-element";
import { browser } from "webextension-polyfill-ts";
import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";
import { nonRandomKey } from "./shared/page-contents-shared";
import { logger } from "./utils/logger";

const rawPort = browser.runtime.connect();
// content-script <-> background page
const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(rawPort));
rawPort.onMessage.addListener((event) => {
    if (event === "textlint-editor-boot") {
        logger.log("[ContentScript]", "boot event received");
        // Inject page-script
        try {
            const script = browser.extension.getURL("scripts/pageScript.js");
            const pageScript = document.createElement("script");
            pageScript.src = script;
            document.body.append(pageScript);
        } catch (error) {
            logger.error(error);
        }
    }
});
// page-script <-> content-script
window.addEventListener("message", (event) => {
    if (
        event.source == window &&
        event.data &&
        event.data.direction == "from-page-script" &&
        event.data.nonRandomKey === nonRandomKey
    ) {
        const lintEngine: LintEngineAPI = {
            lintText: port.lintText,
            fixText: port.fixText,
            ignoreText: port.ignoreText
        };
        const command = event.data.command as keyof typeof lintEngine;
        const args = event.data.args;
        const lintEngineElement = lintEngine[command];
        if (Object.prototype.hasOwnProperty.call(lintEngine, command) && typeof lintEngineElement === "function") {
            const newVar: Promise<any> = lintEngineElement(args);
            newVar.then((result) => {
                window.postMessage(
                    {
                        command: command + "::response",
                        direction: "from-content-script",
                        result
                    },
                    "*"
                );
            });
        }
    }
});
