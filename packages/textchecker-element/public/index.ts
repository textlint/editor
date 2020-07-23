import { TextCheckerElement } from "../src/textchecker-element";
import { TextCheckerPopupElement } from "../src/text-checker-popup-element";
import type { TextlintResult } from "@textlint/types";

const targetElement = document.querySelector("#js-target") as HTMLTextAreaElement;
const textChecker = new TextCheckerElement({
    targetElement: targetElement
});
const textCheckerPopup = new TextCheckerPopupElement();
targetElement.before(textChecker);
document.body.append(textCheckerPopup);
let count = 0;

function debounce(fn: () => void, delay: number) {
    let timeoutId = null;
    return function (...args: any[]) {
        clearTimeout(timeoutId);
        var that = this;
        timeoutId = setTimeout(function () {
            fn.apply(that, args);
        }, delay);
    };
}

const linter = new (window as any).Textlint();
targetElement.addEventListener(
    "input",
    debounce(async () => {
        const result: TextlintResult = await linter.lintText(targetElement.value);
        const messages = result.messages;
        console.log(result);
        const annotations = messages.map((message) => {
            const card = {
                id: message.ruleId + "::" + message.index,
                message: message.message
            };
            return {
                start: message.index,
                end: message.index + 1,
                onMouseEnter: ({ rectItem }) => {
                    console.log("enteR", count);
                    const boundingClientRect = targetElement.getBoundingClientRect();
                    textCheckerPopup.updateCard(card, {
                        index: rectItem.index,
                        top: boundingClientRect.y + rectItem.top + rectItem.height,
                        left: boundingClientRect.x + rectItem.left,
                        width: rectItem.width,
                        height: rectItem.height
                    });
                },
                onMouseLeave() {
                    console.log("leave", count);
                    textCheckerPopup.dismissCard(card);
                }
            };
        });
        textChecker.updateAnnotations(annotations);
    }, 500)
);
