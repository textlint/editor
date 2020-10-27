import { attachToTextArea, LintEngineAPI } from "textchecker-element";
import { nonRandomKey } from "./shared/page-contents-shared";

const targetElement = document.querySelectorAll("textarea");
const commandHandler = <R>(command: string, args: any): Promise<R> => {
    return new Promise<R>((resolve) => {
        console.log("[PageScript]", command, args);
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
const lintEngine: LintEngineAPI = {
    lintText: (args: any) => commandHandler("lintText", args),
    fixText: (args: any) => commandHandler("fixText", args),
    fixAll: (args: any) => commandHandler("fixAll", args),
    fixRule: (args: any) => commandHandler("fixRule", args)
};

async function contentScriptMain() {
    const callback = (textAreaElement: HTMLTextAreaElement) => {
        attachToTextArea({
            textAreaElement: textAreaElement,
            lintingDebounceMs: 200,
            lintEngine: lintEngine
        });
    };
    targetElement.forEach(callback);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                node.querySelectorAll("textarea").forEach(callback);
            });
        });
    });
    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });
}

console.log("[PageScript]", "main loaded");
contentScriptMain().catch((error) => {
    console.error("[PageScript] Error", error);
});
