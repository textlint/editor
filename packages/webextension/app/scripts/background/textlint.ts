import { browser } from "webextension-polyfill-ts";
import type { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";
import type { LintEngineAPI } from "textchecker-element";
import { TextlintWorkerCommandFix, TextlintWorkerCommandLint, TextlintWorkerCommandResponse } from "@textlint/compiler";

browser.runtime.onInstalled.addListener((details) => {
    console.log("previousVersion", details.previousVersion);
});

browser.tabs.onUpdated.addListener(async (tabId) => {
    browser.pageAction.show(tabId);
});
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
const createWorkerRef = (worker: Worker) => {
    let currentWorker: Worker = worker;
    let currentWorkerStatus = waiterForInit(worker);
    return {
        current: currentWorker,
        ready: currentWorkerStatus.ready,
        updateWorker(worker: Worker) {
            currentWorker = worker;
            currentWorkerStatus = waiterForInit(worker);
        }
    };
};
export const createTextlintWorker = (defaultWorkerUrl: string | URL = "download/textlint.js") => {
    const defaultWorker = new Worker(defaultWorkerUrl);
    const workerRef = createWorkerRef(defaultWorker);
    const lintText = async ({ text, ext }: { text: string; ext: string }): Promise<TextlintResult[]> => {
        return new Promise((resolve, _reject) => {
            workerRef.current.addEventListener(
                "message",
                function (event) {
                    const data: TextlintWorkerCommandResponse = event.data;
                    if (data.command === "lint:result") {
                        resolve([data.result]);
                    }
                },
                {
                    once: true
                }
            );
            return workerRef.current.postMessage({
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
        message?: TextlintMessage;
    }): Promise<TextlintFixResult> => {
        return new Promise((resolve, _reject) => {
            workerRef.current.addEventListener(
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
            return workerRef.current.postMessage({
                command: "fix",
                text,
                ruleId: message?.ruleId,
                ext: ext
            } as TextlintWorkerCommandFix);
        });
    };
    const log = (...args: any[]) => {
        console.log("[Background]", ...args);
    };
    return {
        createLintEngine({ ext }: { ext: string }) {
            const lintEngine: LintEngineAPI = {
                lintText: ({ text }) =>
                    lintText({ text, ext }).then((result) => {
                        log("lintText", result);
                        return result;
                    }),
                fixText: async ({ text, message }): Promise<{ output: string }> => {
                    if (!message.fix || !message.fix.range) {
                        return { output: text };
                    }
                    // replace fix.range[0, 1] with fix.text
                    const result = {
                        output:
                            text.slice(0, message.fix.range[0]) + message.fix.text + text.slice(message.fix.range[1])
                    };
                    log("fixText", result);
                    return result;
                },
                fixAll({ text }: { text: string }): Promise<TextlintFixResult> {
                    return fixText({ text, ext }).then((result) => {
                        log("fixAll", result);
                        return result;
                    });
                },
                fixRule({ text, message }: { text: string; message: TextlintMessage }): Promise<TextlintFixResult> {
                    return fixText({ text, message, ext }).then((result) => {
                        log("fixRule", result);
                        return result;
                    });
                }
            };
            return lintEngine;
        },
        ready() {
            return workerRef.ready();
        },
        dispose() {
            return workerRef.current.terminate();
        },
        updateWorker(workerUrl: string | URL) {
            workerRef.updateWorker(new Worker(workerUrl));
        }
    };
};
