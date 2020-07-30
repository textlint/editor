import { TextCheckerElement } from "./text-checker-element";
import { TextCheckerCard, TextCheckerPopupElement } from "./text-checker-popup-element";
import { TextlintFixResult, TextlintResult, TextlintMessage } from "@textlint/types";
import { TextCheckerElementRectItem } from "./text-checker-store";
import pDebounce from "p-debounce";

const createCompositionHandler = () => {
    let onComposition = false;
    return {
        onComposition,
        handleEvent: (event: Event) => {
            if (event.type === "compositionend") {
                onComposition = false;
            } else if (event.type === "compositionstart") {
                onComposition = true;
            }
        }
    };
};

export type AttachTextAreaParams = {
    /**
     * target textarea element
     */
    textAreaElement: HTMLTextAreaElement;
    /**
     * linting debounce timeout millisecond
     * default: 200ms
     */
    lintingDebounceMs: number;
    // process
    lintText: ({ text }: { text: string }) => Promise<TextlintResult>;
    fixText: ({ text, message }: { text: string; message: TextlintMessage }) => Promise<TextlintFixResult>;
};

/**
 * Attach text-checker component to `<textarea>` element
 */
export const attachToTextArea = ({ textAreaElement, lintingDebounceMs, lintText, fixText }: AttachTextAreaParams) => {
    const textChecker = new TextCheckerElement({
        targetElement: textAreaElement,
        hoverPadding: 4
    });
    const textCheckerPopup = new TextCheckerPopupElement();
    textAreaElement.before(textChecker);
    document.body.append(textCheckerPopup);

    const compositionHandler = createCompositionHandler();
    const update = pDebounce(async () => {
        // stop lint on IME composition
        if (compositionHandler.onComposition) {
            return;
        }
        const text = textAreaElement.value;
        const result = await lintText({
            text
        });
        const annotations = result.messages.map((message) => {
            const card: TextCheckerCard = {
                id: message.ruleId + "::" + message.index,
                message: message.message,
                fixable: Boolean(message.fix)
            };
            return {
                start: message.index,
                end: message.index + 1,
                onMouseEnter: ({ rectItem }: { rectItem: TextCheckerElementRectItem }) => {
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
                                const currentText = text;
                                const fixResult = await fixText({
                                    text,
                                    message
                                });
                                if (currentText === text && currentText !== fixResult.output) {
                                    textAreaElement.value = fixResult.output;
                                    await update();
                                    textCheckerPopup.dismissCard(card);
                                }
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
    }, lintingDebounceMs);
    // add event handlers
    textAreaElement.addEventListener("compositionstart", compositionHandler);
    textAreaElement.addEventListener("compositionend", compositionHandler);
    textAreaElement.addEventListener("input", update);
    update();
};
