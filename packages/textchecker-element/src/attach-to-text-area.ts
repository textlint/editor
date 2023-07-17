import { TextCheckerElement } from "./text-checker-element";
import { TextCheckerCard, TextCheckerPopupElement, TextCheckerPopupElementArgs } from "./text-checker-popup-element";
import type { TextlintMessage, TextlintResult } from "@textlint/types";
import type { TextCheckerElementRectItem } from "./text-checker-store";
import pDebounce from "p-debounce";
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

const createTextCheckerPopupElement = (args: TextCheckerPopupElementArgs) => {
    const textCheckerPopup = new TextCheckerPopupElement(args);
    document.body.append(textCheckerPopup);
    return textCheckerPopup;
};

/**
 * Return true if the element in viewport
 * @param element
 */
function isVisibleInViewport(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
        return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.height === 0 || rect.width === 0) {
        return false;
    }
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Dismiss all popup
 *
 * - Update text(includes fixed)
 * - Scroll textarea/Scroll window
 * - Focus on textarea
 * - Click out of textarea/popup
 * - popup → textarea → other → dismiss
 * - textarea → popup → other → dismiss
 */

/**
 * Dismiss a single popup(500ms delay)
 *
 * - Leave from popup
 * - Leave from RectItem
 * - Focus on textarea
 *
 */

/**
 * Show popup condition
 * - onUpdate
 */

/**
 * Attach text-checker component to `<textarea>` element
 */
export const attachToTextArea = ({
    textAreaElement,
    lintingDebounceMs,
    lintEngine
}: AttachTextAreaParams): (() => void) => {
    if (!textAreaElement) {
        debug("Can not attach. No textarea", textAreaElement);
        return () => {};
    }
    if (textAreaElement.readOnly) {
        debug("Can not attach textarea that is readonly", textAreaElement);
        return () => {};
    }
    if (textAreaElement.dataset.attachedTextCheckerElement === "true") {
        debug("Can not attach textarea that is already attached", textAreaElement);
        return () => {};
    }
    const dismissCards = () => {
        debug("dismissCards", {
            textCheckerPopup: textCheckerPopup.isHovering,
            textChecker: textChecker.isHovering,
            textCheckerF: textChecker.isFocus
        });
        if (!textCheckerPopup.isHovering && !textChecker.isHovering && !textChecker.isFocus) {
            textCheckerPopup.dismissCards();
            textChecker.resetHoverState();
        }
    };
    const textCheckerPopup = createTextCheckerPopupElement({
        onLeave() {
            dismissCards();
        }
    });
    const textChecker = new TextCheckerElement({
        targetElement: textAreaElement,
        hoverPadding: 20,
        onLeave() {
            dismissCards();
        }
    });
    textAreaElement.before(textChecker);
    const compositionHandler = createCompositionHandler();
    const update = pDebounce(async () => {
        if (!isVisibleInViewport(textAreaElement)) {
            return;
        }
        // stop lint on IME composition
        if (compositionHandler.onComposition) {
            return;
        }
        // dismiss card before update annotations
        // dismissCards();
        const text = textAreaElement.value;
        const results = await lintEngine.lintText({
            text
        });
        debug("lint results", results);
        const updateText = async (newText: string, card: TextCheckerCard) => {
            const currentText = textAreaElement.value;
            if (currentText === text && currentText !== newText) {
                textAreaElement.value = newText;
                await updateOrClearAnnotationsIfFailed();
                textCheckerPopup.dismissCard(card);
            }
        };
        const annotations = results.flatMap((result) => {
            return result.messages.map((message) => {
                const card: TextCheckerCard = {
                    id: `${message.ruleId}::${message.range[0]}-${message.range[1]}`,
                    message: message.message,
                    messageRuleId: message.ruleId,
                    fixable: Boolean(message.fix)
                };
                let dismissTimerId: null | any = null;
                return {
                    id: `${message.ruleId}::${message.range[0]}-${message.range[1]}`,
                    start: message.range[0],
                    end: message.range[1],
                    onMouseEnter: ({ rectItem }: { rectItem: TextCheckerElementRectItem }) => {
                        debug("annotation - onMouseEnter");
                        if (dismissTimerId) {
                            clearTimeout(dismissTimerId);
                        }
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
                                    await updateOrClearAnnotationsIfFailed();
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
                            debug("annotation - onMouseLeave");
                            dismissTimerId = setTimeout(() => {
                                const isHover = textChecker.isHoverRectItem(rectItem);
                                debug("dismiss", {
                                    textCheckerPopup: textCheckerPopup.isHovering,
                                    isRectElementHover: isHover
                                });
                                if (textCheckerPopup.isHovering || isHover) {
                                    return;
                                }
                                textCheckerPopup.dismissCard(card);
                            }, 500);
                        } catch (error) {
                            debug("Abort dismiss popup", error);
                        }
                    }
                };
            });
        });
        debug("annotations", annotations);
        textChecker.updateAnnotations(annotations);
    }, lintingDebounceMs);
    const updateOrClearAnnotationsIfFailed = async () => {
        try {
            await update();
        } catch (error) {
            debug("update error", error);
            textChecker.updateAnnotations([]);
        }
    };
    // Events
    // when resize element, update annotation
    const resizeObserver = new ResizeObserver(() => {
        debug("ResizeObserver do update");
        textCheckerPopup.dismissCards();
        textChecker.resetAnnotations();
        updateOrClearAnnotationsIfFailed();
    });
    resizeObserver.observe(textAreaElement);
    // when scroll window, update annotation
    const onScroll = () => {
        textCheckerPopup.dismissCards();
        textChecker.resetAnnotations();
        updateOrClearAnnotationsIfFailed();
    };
    const onFocus = () => {
        textCheckerPopup.dismissCards();
        updateOrClearAnnotationsIfFailed();
    };
    const onBlur = (event: FocusEvent) => {
        // does not dismiss on click popup items(require tabindex)
        if (event.relatedTarget === textChecker || event.relatedTarget === textCheckerPopup) {
            return;
        }
        textCheckerPopup.dismissCards();
    };
    textAreaElement.addEventListener("compositionstart", compositionHandler);
    textAreaElement.addEventListener("compositionend", compositionHandler);
    textAreaElement.addEventListener("input", update);
    textAreaElement.addEventListener("focus", onFocus);
    textAreaElement.addEventListener("blur", onBlur);
    textAreaElement.addEventListener("focusout", dismissCards);
    window.addEventListener("scroll", onScroll);
    // when scroll the element, update annotation
    textAreaElement.addEventListener("scroll", onScroll);
    updateOrClearAnnotationsIfFailed();
    return () => {
        window.removeEventListener("scroll", onScroll);
        textAreaElement.removeEventListener("scroll", onScroll);
        textAreaElement.removeEventListener("compositionstart", compositionHandler);
        textAreaElement.removeEventListener("compositionend", compositionHandler);
        textAreaElement.removeEventListener("input", update);
        textAreaElement.removeEventListener("focus", onFocus);
        textAreaElement.removeEventListener("blur", onBlur);
        resizeObserver.disconnect();
    };
};
