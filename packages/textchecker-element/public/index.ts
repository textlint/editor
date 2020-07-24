import { TextCheckerElement } from "../src/textchecker-element";
import { TextCheckerPopupElement } from "../src/text-checker-popup-element";
import type { TextlintResult } from "@textlint/types";
import { RectItem } from "../src/textchecker-store";

const targetElement = document.querySelector("#js-target") as HTMLTextAreaElement;
const textChecker = new TextCheckerElement({
    targetElement: targetElement,
    hoverPadding: 4
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
const update = debounce(async () => {
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
            onMouseEnter: ({ rectItem }: { rectItem: RectItem }) => {
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
}, 500);
targetElement.addEventListener("input", update);
update();
