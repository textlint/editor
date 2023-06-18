import { attachToTextArea, LintEngineAPI } from "./src";
import type { TextlintScriptMetadata } from "@textlint/script-parser";
import type { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";
import { applyFixesToText } from "@textlint/source-code-fixer";
import type {
    TextlintWorkerCommandFix,
    TextlintWorkerCommandLint,
    TextlintWorkerCommandResponse
} from "@textlint/script-compiler";

const statusElement = document.querySelector("#js-status");
const updateStatus = (status: string) => {
    if (statusElement) {
        statusElement.textContent = status;
    }
};
const waiterForInit = (worker: Worker) => {
    let _resolve: null | ((init: TextlintScriptMetadata) => void) = null;
    const deferred = new Promise<TextlintScriptMetadata>((resolve) => {
        _resolve = resolve;
    });
    worker.addEventListener(
        "message",
        function (event) {
            const data: TextlintWorkerCommandResponse = event.data;
            if (data.command === "init") {
                _resolve && _resolve(data.metadata);
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
const generateMessageId = () => crypto.randomUUID();
const createTextlint = ({ worker, ext }: { worker: Worker; ext: string }) => {
    const lintText: LintEngineAPI["lintText"] = async ({ text }: { text: string }): Promise<TextlintResult[]> => {
        updateStatus("linting...");
        return new Promise((resolve, reject) => {
            const id = generateMessageId();
            function onMessage(event: MessageEvent<TextlintWorkerCommandResponse>) {
                const data = event.data;
                if ("id" in data && data.id === id) {
                    if (data.command === "lint:error") {
                        reject(data.error);
                        updateStatus("failed to lint");
                    } else if (data.command === "lint:result") {
                        resolve([data.result]);
                        updateStatus("linted");
                    }
                    worker.removeEventListener("message", onMessage);
                    worker.removeEventListener("messageerror", onMessageError);
                    worker.removeEventListener("error", onError);
                }
            }
            function onMessageError(event: MessageEvent<any>) {
                reject(event.data);
                updateStatus("failed to lint");
                worker.removeEventListener("message", onMessage);
                worker.removeEventListener("messageerror", onMessageError);
                worker.removeEventListener("error", onError);
            }
            function onError(event: ErrorEvent) {
                reject(event);
                updateStatus("failed to lint");
                worker.removeEventListener("message", onMessage);
                worker.removeEventListener("messageerror", onMessageError);
                worker.removeEventListener("error", onError);
            }
            worker.addEventListener("message", onMessage);
            worker.addEventListener("messageerror", onMessageError);
            worker.addEventListener("error", onError);
            return worker.postMessage({
                id,
                command: "lint",
                text,
                ext: ext
            } as TextlintWorkerCommandLint);
        });
    };
    const fixText = async ({
        text,
        message
    }: {
        text: string;
        message?: TextlintMessage;
    }): Promise<TextlintFixResult> => {
        updateStatus("fixing...");
        return new Promise((resolve, reject) => {
            const id = generateMessageId();
            function onMessage(event: MessageEvent<TextlintWorkerCommandResponse>) {
                const data = event.data;
                if ("id" in data && data.id === id) {
                    if (data.command === "fix:error") {
                        reject(data.error);
                        updateStatus("failed to fix");
                    } else if (data.command === "fix:result") {
                        resolve(data.result);
                        updateStatus("fixed");
                    }
                    worker.removeEventListener("message", onMessage);
                    worker.removeEventListener("messageerror", onMessageError);
                    worker.removeEventListener("error", onError);
                }
            }
            function onMessageError(event: MessageEvent<any>) {
                reject(event.data);
                updateStatus("failed to fix");
                worker.removeEventListener("message", onMessage);
                worker.removeEventListener("messageerror", onMessageError);
                worker.removeEventListener("error", onError);
            }
            function onError(event: ErrorEvent) {
                reject(event);
                updateStatus("failed to fix");
                worker.removeEventListener("message", onMessage);
                worker.removeEventListener("messageerror", onMessageError);
                worker.removeEventListener("error", onError);
            }
            worker.addEventListener("message", onMessage);
            worker.addEventListener("messageerror", onMessageError);
            worker.addEventListener("error", onError);
            return worker.postMessage({
                id,
                command: "fix",
                text,
                ruleId: message?.ruleId,
                ext: ext
            } as TextlintWorkerCommandFix);
        });
    };
    return {
        lintText,
        fixText
    };
};

function escapeHTML(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Entry point
 * @param workerUrl
 */
export async function run(workerUrl: string) {
    const worker = new Worker(workerUrl);
    const workerStatus = waiterForInit(worker);
    const text = new URL(location.href).searchParams.get("text");
    const targetElement = document.querySelectorAll("textarea");
    const textlint = createTextlint({ worker, ext: ".md" });
    const metadata = await workerStatus.ready();
    type IgnoreTextSet = Set<string>;
    const ignoreMarkMap = new Map<string, IgnoreTextSet>();
    const getMatchText = (text: string, message: TextlintMessage) => {
        // workaround: textlint message has not range
        const range = message.fix ? message.fix.range : [message.index, message.index + 1];
        return text.slice(range[0], range[1]);
    };
    const isIgnored = ({ text, message }: { text: string; message: TextlintMessage }) => {
        const ignoredSet = ignoreMarkMap.get(message.ruleId);
        if (!ignoredSet) {
            return false;
        }
        return ignoredSet.has(getMatchText(text, message));
    };
    const lintEngine: LintEngineAPI = {
        async lintText({ text }) {
            const results = await textlint.lintText({ text });
            return results.map((result) => {
                return {
                    filePath: result.filePath,
                    messages: result.messages.filter((message) => !isIgnored({ text, message }))
                };
            });
        },
        async fixText({ text, messages }): Promise<{ output: string }> {
            const fixableMessages = messages.filter((message) => !isIgnored({ text, message }));
            return {
                output: applyFixesToText(text, fixableMessages)
            };
        },
        async ignoreText({ text, message }: { text: string; message: TextlintMessage }): Promise<boolean> {
            const ignoreSet = ignoreMarkMap.get(message.ruleId) ?? new Set<string>();
            ignoreSet.add(getMatchText(text, message));
            ignoreMarkMap.set(message.ruleId, ignoreSet);
            return true;
        }
    };
    targetElement.forEach((element) => {
        if (text) {
            element.value = text;
        }
        attachToTextArea({
            textAreaElement: element,
            lintingDebounceMs: 200,
            lintEngine
        });
    });
    // metadata
    const metadataDiv = document.createElement("div");
    metadataDiv.innerHTML = `
<h3>Script metadata</h3>
<ul>
    ${Object.entries(metadata)
        .map(([key, value]) => {
            const toValue = (key: string, value: any) => {
                if (key === "homepage") {
                    return `<a href="${escapeHTML(value)}">${escapeHTML(value)}</a>`;
                }
                return typeof value === "object"
                    ? `<pre>${escapeHTML(JSON.stringify(value, null, 4))}</pre>`
                    : escapeHTML(value);
            };
            return `<dt>${escapeHTML(key)}</dt><dd>${toValue(key, value)}</dd>`;
        })
        .join("\n")}
</ul>`;
    document.querySelector("#metadata")?.append(metadataDiv);
    // install - textlint-editor extension will hook it
    document.querySelector("#install")?.addEventListener("click", () => {
        window.open("textlint-worker.js", "_blank");
    });
}
