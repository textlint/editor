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

/**
 * Lint Server API
 */
export type LintEngineAPI = {
    lintText({ text }: { text: string }): Promise<TextlintResult[]>;
    // fix all text with all rule
    fixAll({ text }: { text: string }): Promise<TextlintFixResult>;
    // fix all with with a rule
    fixRule({ text, message }: { text: string; message: TextlintMessage }): Promise<TextlintFixResult>;
    // fix the text
    fixText({ text, message }: { text: string; message: TextlintMessage }): Promise<{ output: string }>;
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
    // user should implement LintEngineAPI and pass it
    lintEngine: LintEngineAPI;
};

/**
 * Attach text-checker component to `<textarea>` element
 */
export const attachToTextArea = ({ textAreaElement, lintingDebounceMs, lintEngine }: AttachTextAreaParams) => {
    const textChecker = new TextCheckerElement({
        targetElement: textAreaElement,
        hoverPadding: 10
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
        const results = await lintEngine.lintText({
            text
        });
        const updateText = async (newText: string, card: TextCheckerCard) => {
            const currentText = textAreaElement.value;
            if (currentText === text && currentText !== newText) {
                textAreaElement.value = newText;
                await update();
                textCheckerPopup.dismissCard(card);
            }
        };
        const annotations = results.flatMap((result) => {
            return result.messages.map((message) => {
                const card: TextCheckerCard = {
                    id: message.ruleId + "::" + message.index,
                    message: message.message,
                    messageRuleId: message.ruleId,
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
                                async onFixText() {
                                    const fixResults = await lintEngine.fixText({
                                        text,
                                        message
                                    });
                                    await updateText(fixResults.output, card);
                                },
                                async onFixAll() {
                                    const fixResults = await lintEngine.fixAll({
                                        text
                                    });
                                    await updateText(fixResults.output, card);
                                },
                                async onFixRule() {
                                    const fixResults = await lintEngine.fixRule({
                                        text,
                                        message
                                    });
                                    await updateText(fixResults.output, card);
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
        });
        textChecker.updateAnnotations(annotations);
    }, lintingDebounceMs);
    // add event handlers
    textAreaElement.addEventListener("compositionstart", compositionHandler);
    textAreaElement.addEventListener("compositionend", compositionHandler);
    textAreaElement.addEventListener("input", update);
    update();
    // when resize element, update annotation
    // @ts-expect-error
    const resizeObserver = new ResizeObserver(() => {
        textChecker.resetAnnotations();
        console.log("textarea resize");
        update();
    });
    resizeObserver.observe(textAreaElement);
    // when scroll window, update annotation
    window.addEventListener("scroll", () => {
        console.log("window scroll");
        textChecker.resetAnnotations();
        update();
    });
    // when scroll the element, update annotation
    textAreaElement.addEventListener("scroll", () => {
        console.log("textarea scroll");
        textChecker.resetAnnotations();
        update();
    });
};
