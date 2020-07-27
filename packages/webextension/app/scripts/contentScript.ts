// @ts-ignore - replace webcomponent to shim
import '@webcomponents/custom-elements'
import { browser } from "webextension-polyfill-ts";
import { TextCheckerElement, TextCheckerElementRectItem, TextCheckerPopupElement } from "textchecker-element";
import { TextlintResult } from "@textlint/types";

const attachTextChecker = (targetElement: HTMLTextAreaElement) => {
    if (!targetElement) {
        return;
    }
    const textChecker = new TextCheckerElement({
        targetElement: targetElement,
        hoverPadding: 4
    });
    const textCheckerPopup = new TextCheckerPopupElement();
    targetElement.before(textChecker);
    document.body.append(textCheckerPopup);

    function debounce(fn: () => void, delay: number) {
        let timeoutId: null | any = null;
        return function (...args: any[]) {
            clearTimeout(timeoutId);
            // @ts-ignore
            var that = this;
            timeoutId = setTimeout(function () {
                // @ts-ignore
                fn.apply(that, args);
            }, delay);
        };
    }

    // @ts-ignore
    const port = browser.runtime.connect({
        name: "textlint-editor"
    });
    const lint = (message: string): Promise<TextlintResult> => {
        port.postMessage({
            command: "lint",
            text: message
        });
        return new Promise((resolve) => {
            const callback = function (response: any) {
                console.log("receive", response);
                resolve(response.result);
                port.onMessage.removeListener(callback);
            };
            port.onMessage.addListener(callback);
        })
    }
    const update = debounce(async () => {
        console.time("lint");
        const result = await lint(targetElement.value);
        console.timeEnd("lint");
        const annotations = result.messages.map((message) => {
            const card = {
                id: message.ruleId + "::" + message.index,
                message: message.message
            };
            return {
                start: message.index,
                end: message.index + 1,
                onMouseEnter: ({rectItem}: { rectItem: TextCheckerElementRectItem }) => {
                    textCheckerPopup.updateCard(card, {
                        top:
                            rectItem.boxBorderWidth +
                            rectItem.boxMarginTop +
                            rectItem.boxPaddingTop +
                            rectItem.boxAbsoluteY +
                            rectItem.top +
                            rectItem.height,
                        left: rectItem.boxAbsoluteX + rectItem.left,
                        width: rectItem.width
                    });
                },
                onMouseLeave() {
                    textCheckerPopup.dismissCard(card);
                }
            };
        });
        textChecker.updateAnnotations(annotations);
    }, 200);
    targetElement.addEventListener("input", update);
    update();
};

const targetElement = document.querySelectorAll("textarea");
targetElement.forEach(element => attachTextChecker(element));
