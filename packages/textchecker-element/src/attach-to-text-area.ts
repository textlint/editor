import { TextCheckerElement } from "./text-checker-element";
import { TextCheckerCard, TextCheckerPopupElement, TextCheckerPopupElementArgs } from "./text-checker-popup-element";
import { TextlintMessage, TextlintResult } from "@textlint/types";
import { TextCheckerElementRectItem } from "./text-checker-store";
import pDebounce from "p-debounce";
import delay from "delay";
import { debug } from "./util/logger";

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
    // Lint Text
    lintText({ text }: { text: string }): Promise<TextlintResult[]>;
    // Fix Text with linted results
    fixText({ text, messages }: { text: string; messages: TextlintMessage[] }): Promise<{ output: string }>;
    // ignore the text
    ignoreText({ text, message }: { text: string; message: TextlintMessage }): Promise<boolean>;
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
const createTextCheckerPopupElement = (args: TextCheckerPopupElementArgs) => {
    if (textCheckerPopup) {
        return textCheckerPopup;
    }
    textCheckerPopup = new TextCheckerPopupElement(args);
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
    const textCheckerPopup = createTextCheckerPopupElement({
        onLeave() {
            textCheckerPopup.dismissCards();
        }
    });
    const compositionHandler = createCompositionHandler();
    const update = pDebounce(async () => {
        // stop lint on IME composition
        if (compositionHandler.onComposition) {
            return;
        }
        // dismiss card before update annotations
        textCheckerPopup.dismissCards();
        const text = textAreaElement.value;
        const results = await lintEngine.lintText({
            text
        });
        debug("lint results", results);
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
                const abortSignalMap = new WeakMap<TextCheckerElementRectItem, AbortController>();
                return {
                    id: `${message.ruleId}::${message.line}:${message.column}`,
                    start: message.index,
                    end: message.index + 1,
                    onMouseEnter: ({ rectItem }: { rectItem: TextCheckerElementRectItem }) => {
                        const controller = abortSignalMap.get(rectItem);
                        debug("enter", controller);
                        if (controller) {
                            controller.abort();
                        }
                        abortSignalMap.set(rectItem, new AbortController());
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
                                        messages: [message]
                                    });
                                    await updateText(fixResults.output, card);
                                },
                                async onFixAll() {
                                    const fixResults = await lintEngine.fixText({
                                        text,
                                        messages: result.messages
                                    });
                                    await updateText(fixResults.output, card);
                                },
                                async onFixRule() {
                                    const messages = result.messages.filter(
                                        (aMessage) => aMessage.ruleId === message.ruleId
                                    );
                                    const fixResults = await lintEngine.fixText({
                                        text,
                                        messages
                                    });
                                    await updateText(fixResults.output, card);
                                },
                                async onIgnore() {
                                    await lintEngine.ignoreText({
                                        text,
                                        message
                                    });
                                    await update();
                                },
                                onSeeDocument() {
                                    const id = message.ruleId.includes("/")
                                        ? message.ruleId.split("/")[1]
                                        : message.ruleId;
                                    window.open(
                                        `https://github.com/search?q=textlint ${encodeURIComponent(id)}`,
                                        "_blank",
                                        "noopener"
                                    );
                                }
                            }
                        });
                    },
                    async onMouseLeave({ rectItem }: { rectItem: TextCheckerElementRectItem }) {
                        try {
                            const controller = abortSignalMap.get(rectItem);
                            debug("leave", controller);
                            await delay(500, {
                                signal: controller?.signal
                            });
                            if (textCheckerPopup.isHovering) {
                                return;
                            }
                            textCheckerPopup.dismissCard(card);
                        } catch (error) {
                            debug("Abort Canceled", error);
                        }
                    }
                };
            });
        });
        debug("annotations", annotations);
        textChecker.updateAnnotations(annotations);
    }, lintingDebounceMs);
    // add event handlers
    const hideAnnotations = () => {
        textCheckerPopup.dismissCards();
    };
    textAreaElement.addEventListener("compositionstart", compositionHandler);
    textAreaElement.addEventListener("compositionend", compositionHandler);
    textAreaElement.addEventListener("input", update);
    textAreaElement.addEventListener("focusout", hideAnnotations);
    update();
    // when resize element, update annotation
    // @ts-expect-error
    const resizeObserver = new ResizeObserver(() => {
        debug("textarea resize");
        textCheckerPopup.dismissCards();
        textChecker.resetAnnotations();
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
        textAreaElement.removeEventListener("compositionstart", compositionHandler);
        textAreaElement.removeEventListener("compositionend", compositionHandler);
        textAreaElement.removeEventListener("input", update);
        textAreaElement.removeEventListener("blur", hideAnnotations);
        resizeObserver.disconnect();
    };
};
