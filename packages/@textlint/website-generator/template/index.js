var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { attachToTextArea } from "https://cdn.skypack.dev/textchecker-element";
const statusElement = document.querySelector("#js-status");
const updateStatus = (status) => {
    if (statusElement) {
        statusElement.textContent = status;
    }
};
const worker = new Worker("textlint.js");
const waiterForInit = (worker) => {
    let initialized = false;
    let _resolve = null;
    const deferred = new Promise((resolve) => {
        _resolve = resolve;
    });
    worker.addEventListener("message", function (event) {
        const data = event.data;
        if (data.command === "init") {
            initialized = true;
            _resolve && _resolve(initialized);
        }
    }, {
        once: true
    });
    return {
        ready() {
            return deferred;
        }
    };
};
const workerStatus = waiterForInit(worker);
const createTextlint = ({ ext }) => {
    const lintText = ({ text }) => __awaiter(void 0, void 0, void 0, function* () {
        updateStatus("linting...");
        return new Promise((resolve, _reject) => {
            worker.addEventListener("message", function (event) {
                const data = event.data;
                if (data.command === "lint:result") {
                    resolve([data.result]);
                }
                updateStatus("linted");
            }, {
                once: true
            });
            return worker.postMessage({
                command: "lint",
                text,
                ext: ext
            });
        });
    });
    const fixText = ({ text, message }) => __awaiter(void 0, void 0, void 0, function* () {
        updateStatus("fixing...");
        return new Promise((resolve, _reject) => {
            worker.addEventListener("message", function (event) {
                const data = event.data;
                if (data.command === "fix:result") {
                    resolve(data.result);
                }
                updateStatus("fixed");
            }, {
                once: true
            });
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const text = new URL(location.href).searchParams.get("text");
    const targetElement = document.querySelectorAll("textarea");
    const textlint = createTextlint({ ext: ".md" });
    yield workerStatus.ready();
    const lintEngine = {
        lintText: textlint.lintText,
        fixText: ({ text, message }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!message.fix || !message.fix.range) {
                return { output: text };
            }
            // replace fix.range[0, 1] with fix.text
            return {
                output: text.slice(0, message.fix.range[0]) + message.fix.text + text.slice(message.fix.range[1])
            };
        }),
        fixAll({ text }) {
            return textlint.fixText({ text });
        },
        fixRule({ text, message }) {
            return textlint.fixText({ text, message });
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
}))();
