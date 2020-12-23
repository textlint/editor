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
    // merge config and update
    mergeConfig?({ textlintrc }: { textlintrc: string }): Promise<void>;
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

let textCheckerPopup: TextCheckerPopupElement;
const createTextCheckerPopupElement = () => {
    if (textCheckerPopup) {
        return textCheckerPopup;
    }
    textCheckerPopup = new TextCheckerPopupElement();
    document.body.append(textCheckerPopup);
    return textCheckerPopup;
};
/**
 * Attach text-checker component to `<textarea>` element
 */
export const attachToTextArea = ({
    textAreaElement,
    lintingDebounceMs,
    lintEngine
}: AttachTextAreaParams): (() => void) => {
    const textChecker = new TextCheckerElement({
        targetElement: textAreaElement,
        hoverPadding: 10
    });
    textAreaElement.before(textChecker);
    const textCheckerPopup = createTextCheckerPopupElement();
    const compositionHandler = createCompositionHandler();
    const update = pDebounce(async () => {
        // stop lint on IME composition
        if (compositionHandler.onComposition) {
            return;
        }
        // dismiss card before update anntations
        textCheckerPopup.dismissCard();
        const text = textAreaElement.value;
        const results = await lintEngine.lintText({
            text
        });
        console.log("[textchecker-element] lint results", results);
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
                    id: `${message.ruleId}::${message.line}:${message.column}`,
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
        console.log("[textchecker-element] annotations", annotations);
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
        console.log("[textchecker-element] textarea resize");
        update();
    });
    resizeObserver.observe(textAreaElement);
    // when scroll window, update annotation
    const onScroll = () => {
        textChecker.resetAnnotations();
        update();
    };
    window.addEventListener("scroll", onScroll);
    // when scroll the element, update annotation
    textAreaElement.addEventListener("scroll", onScroll);
    return () => {
        window.removeEventListener("scroll", onScroll);
        textAreaElement.removeEventListener("scroll", onScroll);
        resizeObserver.disconnect();
    };
};
