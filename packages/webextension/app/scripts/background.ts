import { browser } from "webextension-polyfill-ts";
import { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";
import { TextlintWorkerCommandFix, TextlintWorkerCommandLint, TextlintWorkerCommandResponse } from "@textlint/compiler";
import { createBackgroundEndpoint, isMessagePort } from "comlink-extension";
import * as Comlink from "comlink";

browser.runtime.onInstalled.addListener((details) => {
    console.log("previousVersion", details.previousVersion);
});

browser.tabs.onUpdated.addListener(async (tabId) => {
    browser.pageAction.show(tabId);
});

const worker = new Worker("download/textlint.js");
const waiterForInit = (worker: Worker) => {
    let initialized = false;
    let _resolve: null | ((init: boolean) => void) = null;
    const deferred = new Promise((resolve) => {
        _resolve = resolve;
    });
    worker.addEventListener(
        "message",
        function (event) {
            const data: TextlintWorkerCommandResponse = event.data;
            if (data.command === "init") {
                initialized = true;
                _resolve && _resolve(initialized);
            }
        },
        {
            once: true
        }
    );
    return {
        ready() {
            return deferred;
        }
    };
};

const workerStatus = waiterForInit(worker);

const lintText = async ({ text, ext }: { text: string; ext: string }): Promise<TextlintResult> => {
    return new Promise((resolve, _reject) => {
        worker.addEventListener(
            "message",
            function (event) {
                const data: TextlintWorkerCommandResponse = event.data;
                if (data.command === "lint:result") {
                    resolve(data.result);
                }
            },
            {
                once: true
            }
        );
        return worker.postMessage({
            command: "lint",
            text,
            ext
        } as TextlintWorkerCommandLint);
    });
};
const fixText = async ({
    text,
    ext,
    message
}: {
    text: string;
    ext: string;
    message: TextlintMessage;
}): Promise<TextlintFixResult> => {
    return new Promise((resolve, _reject) => {
        worker.addEventListener(
            "message",
            function (event) {
                const data: TextlintWorkerCommandResponse = event.data;
                if (data.command === "fix:result") {
                    resolve(data.result);
                }
            },
            {
                once: true
            }
        );
        return worker.postMessage({
            command: "fix",
            text,
            ruleId: message.ruleId,
            ext: ext
        } as TextlintWorkerCommandFix);
    });
};
// receive
const backgroundExposedObject = {
    lintText: lintText,
    fixText: fixText
};
export type backgroundExposedObject = typeof backgroundExposedObject;
browser.runtime.onConnect.addListener(async (port) => {
    if (isMessagePort(port)) {
        return;
    }
    await workerStatus.ready();
    Comlink.expose(backgroundExposedObject, createBackgroundEndpoint(port));
});
