import { attachToTextArea } from "../src/index";
import { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";
import { AttachTextAreaParams } from "../src/attach-to-text-area";
import type {
    TextlintWorkerCommandFix,
    TextlintWorkerCommandLint,
    TextlintWorkerCommandResponse
} from "@textlint/compiler";

const updateStatus = (status: string) => {
    document.querySelector("#js-status").textContent = status;
};
const worker = new Worker("textlint.js");
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

const createTextlint = ({ ext }: { ext: string }) => {
    const lintText: AttachTextAreaParams["lintText"] = async ({ text }: { text: string }): Promise<TextlintResult> => {
        updateStatus("linting...");
        return new Promise((resolve, _reject) => {
            worker.addEventListener(
                "message",
                function (event) {
                    const data: TextlintWorkerCommandResponse = event.data;
                    if (data.command === "lint:result") {
                        resolve(data.result);
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
            } as TextlintWorkerCommandLint);
        });
    };
    const fixText: AttachTextAreaParams["fixText"] = async ({
        text,
        message
    }: {
        text: string;
        message: TextlintMessage;
    }): Promise<TextlintFixResult> => {
        updateStatus("fixing...");
        return new Promise((resolve, _reject) => {
            worker.addEventListener(
                "message",
                function (event) {
                    const data: TextlintWorkerCommandResponse = event.data;
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
                ruleId: message.ruleId,
                ext: ext
            } as TextlintWorkerCommandFix);
        });
    };
    return {
        lintText,
        fixText
    };
};

(async () => {
    const targetElement = document.querySelectorAll("textarea");
    const textlint = createTextlint({ ext: ".md" });
    await workerStatus.ready();
    targetElement.forEach((element) => {
        attachToTextArea({
            textAreaElement: element,
            lintingDebounceMs: 200,
            lintText: textlint.lintText,
            fixText: textlint.fixText
        });
    });
})();
