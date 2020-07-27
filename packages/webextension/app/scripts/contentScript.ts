// @ts-ignore - replace webcomponent to shim
import '@webcomponents/custom-elements'
import { browser } from "webextension-polyfill-ts";
import { TextCheckerElement, TextCheckerCard, TextCheckerPopupElement,TextCheckerElementRectItem } from "textchecker-element";
import { TextlintFixResult, TextlintResult } from "@textlint/types";

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
    const lintText = (message: string): Promise<TextlintResult> => {
        return new Promise((resolve) => {
            const callback = function (response: any) {
                console.log("lint result", response);
                if (response.command === "lint::result") {
                    resolve(response.result);
                }
                port.onMessage.removeListener(callback);
            };
            port.onMessage.addListener(callback);
            port.postMessage({
                command: "lint",
                text: message,
                ext: ".md"
            });
        })
    }

    const fixText = async (message: string): Promise<TextlintFixResult> => {
        return new Promise((resolve, _reject) => {
            const callback = function (response: any) {
                console.log("fix result", response);
                if (response.command === "fix::result") {
                    resolve(response.result);
                }
                port.onMessage.removeListener(callback);
            };
            port.onMessage.addListener(callback);
            port.postMessage({
                command: "fix",
                text: message,
                ext: ".md"
            });
        });
    };

    const update = debounce(async () => {
        console.time("lint");
        const result = await lintText(targetElement.value);
        console.timeEnd("lint");
        const annotations = result.messages.map((message) => {
            const card: TextCheckerCard = {
                id: message.ruleId + "::" + message.index,
                message: message.message,
                fixable: Boolean(message.fix)
            };
            return {
                start: message.index,
                end: message.index + 1,
                onMouseEnter: ({rectItem}: { rectItem: TextCheckerElementRectItem }) => {
                    textCheckerPopup.updateCard({
                        card: card,
                        rect: {
                            top:
                                rectItem.boxBorderWidth +
                                rectItem.boxMarginTop +
                                rectItem.boxPaddingTop +
                                rectItem.boxAbsoluteY +
                                rectItem.top +
                                rectItem.height,
                            left: rectItem.boxAbsoluteX + rectItem.left,
                            width: rectItem.width
                        },
                        handlers: {
                            async onFixIt() {
                                console.log("onFixIt");
                                const currentText = targetElement.value;
                                const fixResult = await fixText(currentText);
                                console.log(currentText, "!==", fixResult.output)
                                if (currentText === targetElement.value && currentText !== fixResult.output) {
                                    targetElement.value = fixResult.output;
                                    update();
                                    textCheckerPopup.dismissCard(card);
                                }
                                console.log("fixResult", fixResult);
                            },
                            onIgnore() {
                                console.log("onIgnore");
                            },
                            onSeeDocument() {
                                console.log("onSeeDocument");
                            }
                        }
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
