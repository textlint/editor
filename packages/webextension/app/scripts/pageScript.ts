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

async function contentScriptMain() {
    const lintEngine: LintEngineAPI = {
        lintText: (args: any) => commandHandler("lintText", args),
        fixText: (args: any) => commandHandler("fixText", args),
        fixAll: (args: any) => commandHandler("fixAll", args),
        fixRule: (args: any) => commandHandler("fixRule", args)
    };
    targetElement.forEach((element) => {
        return attachToTextArea({
            textAreaElement: element,
            lintingDebounceMs: 200,
            lintEngine: lintEngine
        });
    });
}

console.log("[PageScript]", "main loaded");
contentScriptMain().catch((error) => {
    console.error("[PageScript] Error", error);
});
