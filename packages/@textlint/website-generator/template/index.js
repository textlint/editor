var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
import { attachToTextArea } from "https://cdn.skypack.dev/textchecker-element";
import { applyFixesToText } from "@textlint/source-code-fixer";
const statusElement = document.querySelector("#js-status");
const updateStatus = (status) => {
    if (statusElement) {
        statusElement.textContent = status;
    }
};
const worker = new Worker("textlint.js");
const waiterForInit = (worker) => {
    let _resolve = null;
    const deferred = new Promise((resolve) => {
        _resolve = resolve;
    });
    worker.addEventListener(
        "message",
        function (event) {
            const data = event.data;
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
const workerStatus = waiterForInit(worker);
const createTextlint = ({ ext }) => {
    const lintText = ({ text }) =>
        __awaiter(void 0, void 0, void 0, function* () {
            updateStatus("linting...");
            return new Promise((resolve, _reject) => {
                worker.addEventListener(
                    "message",
                    function (event) {
                        const data = event.data;
                        if (data.command === "lint:result") {
                            resolve([data.result]);
                        }
                        updateStatus("linted");
                    },
                    {
                        once: true
                    }
                );
                return worker.postMessage({
                    command: "lint",
                    text,
                    ext: ext
                });
            });
        });
    const fixText = ({ text, message }) =>
        __awaiter(void 0, void 0, void 0, function* () {
            updateStatus("fixing...");
            return new Promise((resolve, _reject) => {
                worker.addEventListener(
                    "message",
                    function (event) {
                        const data = event.data;
                        if (data.command === "fix:result") {
                            resolve(data.result);
                        }
                        updateStatus("fixed");
                    },
                    {
                        once: true
                    }
                );
                return worker.postMessage({
                    command: "fix",
                    text,
                    ruleId: message === null || message === void 0 ? void 0 : message.ruleId,
                    ext: ext
                });
            });
        });
    return {
        lintText,
        fixText
    };
};
export function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
(() =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const text = new URL(location.href).searchParams.get("text");
        const targetElement = document.querySelectorAll("textarea");
        const textlint = createTextlint({ ext: ".md" });
        const metadata = yield workerStatus.ready();
        const ignoreMarkMap = new Map();
        const getMatchText = (text, message) => {
            // workaround: textlint message has not range
            const range = message.fix ? message.fix.range : [message.index, message.index + 1];
            return text.slice(range[0], range[1]);
        };
        const isIgnored = ({ text, message }) => {
            const ignoredSet = ignoreMarkMap.get(message.ruleId);
            if (!ignoredSet) {
                return false;
            }
            return ignoredSet.has(getMatchText(text, message));
        };
        const lintEngine = {
            lintText({ text }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const results = yield textlint.lintText({ text });
                    return results.map((result) => {
                        return {
                            filePath: result.filePath,
                            messages: result.messages.filter((message) => !isIgnored({ text, message }))
                        };
                    });
                });
            },
            fixText({ text, messages }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const fixableMessages = messages.filter((message) => !isIgnored({ text, message }));
                    return {
                        output: applyFixesToText(text, fixableMessages)
                    };
                });
            },
            ignoreText({ text, message }) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    const ignoreSet =
                        (_a = ignoreMarkMap.get(message.ruleId)) !== null && _a !== void 0 ? _a : new Set();
                    ignoreSet.add(getMatchText(text, message));
                    ignoreMarkMap.set(message.ruleId, ignoreSet);
                    return true;
                });
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
            const toValue = (key, value) => {
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
        (_a = document.querySelector("#metadata")) === null || _a === void 0 ? void 0 : _a.append(metadataDiv);
        // install - textlint-editor extension will hook it
        (_b = document.querySelector("#install")) === null || _b === void 0
            ? void 0
            : _b.addEventListener("click", () => {
                  window.open("textlint.js", "_blank");
              });
    }))();
