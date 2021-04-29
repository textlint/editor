import { attachToTextArea, LintEngineAPI } from "textchecker-element";
import { nonRandomKey } from "./shared/page-contents-shared";
import type { TextlintMessage } from "@textlint/types";
import { applyFixesToText } from "@textlint/source-code-fixer";
import { logger } from "./utils/logger";

const commandHandler = <R>(command: string, args: any): Promise<R> => {
    return new Promise<R>((resolve) => {
        logger.log("[PageScript]", command, args);
        const listener = (message: MessageEvent) => {
            if (
                message.data &&
                message.data.direction === "from-content-script" &&
                message.data.command === `${command}::response`
            ) {
                window.removeEventListener("message", listener);
                resolve(message.data.result);
            }
        };
        window.addEventListener("message", listener);
        window.postMessage(
            {
                command,
                args,
                direction: "from-page-script",
                nonRandomKey
            },
            "*"
        );
    });
};
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
        const results = await commandHandler<ReturnType<LintEngineAPI["lintText"]>>("lintText", { text });
        logger.log("results", results);
        return results.map((result) => {
            return {
                filePath: result.filePath,
                messages: result.messages.filter((message) => !isIgnored({ text, message }))
            };
        });
    },
    // Note: currently does not use background implementation.
    // Just use @textlint/source-code-fixer
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
const isHTMLTextAreaElement = (element: Element): element is HTMLTextAreaElement => {
    return element.tagName.toLowerCase() === "textarea";
};
const shouldSkipPage = () => {
    return document.body.dataset.textlintEditorEmbedded !== undefined;
};

async function contentScriptMain() {
    if (shouldSkipPage()) {
        logger.log("Skip @textlint/editor because this page already has been embedded.");
        return;
    }
    const attachedSet = new WeakSet<HTMLTextAreaElement>();
    const callback = (textAreaElement: HTMLTextAreaElement) => {
        if (attachedSet.has(textAreaElement)) {
            return;
        }
        logger.log("[contentScript] attach textarea", textAreaElement);
        attachToTextArea({
            textAreaElement: textAreaElement,
            lintingDebounceMs: 200,
            lintEngine: lintEngine
        });
        attachedSet.add(textAreaElement);
    };
    const targetElement = document.querySelectorAll("textarea:not([readonly])");
    targetElement.forEach((element) => {
        if (isHTMLTextAreaElement(element)) {
            callback(element);
        }
    });
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                node.querySelectorAll("textarea:not([readonly])").forEach((value) => {
                    callback(value as HTMLTextAreaElement);
                });
            });
        });
    });
    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });
}

logger.log("[PageScript]", "main loaded");
contentScriptMain().catch((error) => {
    logger.error("[PageScript] Error", error);
});
