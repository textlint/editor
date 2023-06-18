import type { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";
import type { LintEngineAPI } from "textchecker-element";
import {
    TextlintWorkerCommandFix,
    TextlintWorkerCommandLint,
    TextlintWorkerCommandMergeConfig,
    TextlintWorkerCommandResponse
} from "@textlint/script-compiler";
import type { TextlintRcConfig } from "@textlint/config-loader";
import { Script } from "./database";
import { logger } from "../utils/logger";

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
const generateMessageId = () => crypto.randomUUID();
export type TextlintWorker = ReturnType<typeof createTextlintWorker>;
export const createTextlintWorker = (script: Script) => {
    const blob = new Blob([script.code], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const textlintrc = JSON.parse(script.textlintrc) as TextlintRcConfig;
    const defaultWorker = new Worker(workerUrl);
    const workerRef = createWorkerRef(defaultWorker);
    const lintText = async ({ text, ext }: { text: string; ext: string }): Promise<TextlintResult[]> => {
        return new Promise((resolve, _reject) => {
            const id = generateMessageId();
            workerRef.current.addEventListener("message", function handler(event) {
                const data: TextlintWorkerCommandResponse = event.data;
                if (data.command === "lint:result" && data.id === id) {
                    resolve([data.result]);
                    workerRef.current.removeEventListener("message", handler);
                }
            });
            return workerRef.current.postMessage({
                id,
                command: "lint",
                text,
                ext
            } as TextlintWorkerCommandLint);
        });
    };
    // Note: currently does not use background implementation.
    // Just use @textlint/source-code-fixer
    // See pageScript.ts
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
            const id = generateMessageId();
            workerRef.current.addEventListener("message", function handler(event) {
                const data: TextlintWorkerCommandResponse = event.data;
                if (data.command === "fix:result" && data.id === id) {
                    resolve(data.result);
                    workerRef.current.removeEventListener("message", handler);
                }
            });
            return workerRef.current.postMessage({
                id,
                command: "fix",
                text,
                ruleId: message?.ruleId,
                ext: ext
            } as TextlintWorkerCommandFix);
        });
    };
    const mergeConfig = async ({ textlintrc }: { textlintrc: TextlintRcConfig }): Promise<void> => {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                resolve();
            });
            return workerRef.current.postMessage({
                command: "merge-config",
                textlintrc
            } as TextlintWorkerCommandMergeConfig);
        });
    };
    const log = (...args: any[]) => {
        logger.log(...args);
    };
    return {
        createLintEngine({ ext }: { ext: string }) {
            const lintEngine: LintEngineAPI = {
                lintText: ({ text }) =>
                    lintText({ text, ext }).then((result) => {
                        log("lintText", result);
                        return result;
                    }),
                fixText({ text }): Promise<{ output: string }> {
                    return fixText({ text, ext }).then((result) => {
                        log("fixAll", result);
                        return result;
                    });
                },
                ignoreText(): Promise<boolean> {
                    throw new Error("No implement");
                }
            };
            return lintEngine;
        },
        ready() {
            return workerRef.ready().then(() => {
                if (!textlintrc) {
                    return;
                }
                return mergeConfig({ textlintrc });
            });
        },
        dispose() {
            return workerRef.current.terminate();
        },
        updateWorker(workerUrl: string | URL) {
            workerRef.updateWorker(new Worker(workerUrl));
        }
    };
};
