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

const worker = new Worker('textlint.js');
const waiterForInit = () => {
    let initialized = false;
    let _resolve: null | ((init: boolean) => void) = null;
    const deferred = new Promise((resolve) => {
        _resolve = resolve;
    })
    worker.addEventListener('message', function (event) {
        if (event.data.command === "init") {
            initialized = true;
            _resolve(initialized);
        }
    }, {
        once: true
    })
    return {
        ready() {
            return deferred;
        }
    }
}
const workerStatus = waiterForInit();
const lint = async (message: string): Promise<TextlintResult> => {
    await workerStatus.ready();
    return new Promise((resolve, _reject) => {
        worker.addEventListener('message', function (event) {
            if (event.data.command === "lint:result") {
                resolve(event.data.result);
            }
        }, {
            once: true
        });
        return worker.postMessage({
            command: "lint",
            text: message,
            ext: ".md"
        });
    });
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
            onMouseEnter: ({rectItem}: { rectItem: RectItem }) => {
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
