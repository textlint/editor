import { getCoordinates } from "./util/text-caret-pos";
import { html, render } from "lit-html";
import {
    AnnotationItem,
    createTextCheckerStore,
    TextCheckerElementRectItem,
    TextCheckerState
} from "./text-checker-store";
// @ts-ignore
import toPX from "to-px";

export type TextCheckerElementAttributes = {
    onEnter?: () => void;
    onLeave?: () => void;
    targetElement: HTMLTextAreaElement;
    hoverPadding: number;
};
const Marker = (rect: TextCheckerElementRectItem, isHighLight: boolean = false) => {
    if (isHighLight) {
        return html`<span
            style="pointer-events: none; border: 2px dotted red; position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"
        ></span>`;
    } else {
        return html`<span
            style="pointer-events: none; border-bottom: 2px dotted red; position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"
        ></span>`;
    }
};

export class TextCheckerElement extends HTMLElement {
    private annotationBox!: HTMLDivElement;
    private targetElement!: HTMLTextAreaElement;
    private store: ReturnType<typeof createTextCheckerStore>;
    private hoverPadding: number = 8;
    private target!: string;
    public isFocus: boolean = false;
    public isHovering: boolean = false;
    private onEnter: (() => void) | undefined;
    private onLeave: (() => void) | undefined;

    constructor(args: TextCheckerElementAttributes) {
        super();
        this.store = createTextCheckerStore();
        this.targetElement = args?.targetElement;
        this.onEnter = args?.onEnter;
        this.onLeave = args?.onLeave;
        this.hoverPadding = args?.hoverPadding ?? 8;
    }

    static get observedAttributes() {
        return ["target", "hoverPadding"] as const;
    }

    attributeChangedCallback = (
        name: typeof TextCheckerElement.observedAttributes[number],
        _oldValue: any,
        newValue: any
    ) => {
        if (this[name]) {
            // @ts-ignore
            this[name] = newValue;
            if (name === "target") {
                this.targetElement = document.querySelector(newValue);
            }
        }
    };

    connectedCallback(): void {
        const target = this.targetElement;
        if (!target) {
            throw new Error("target element is not found");
        }
        const shadow = this.attachShadow({ mode: "closed" });
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.setAttribute(
            "style",
            "color: transparent; border: position: absolute; top: 0px; left: 0px; pointer-events: none;"
        );
        const annotationBox = document.createElement("div");
        annotationBox.className = "annotationBox";
        overlay.append(annotationBox);
        shadow.append(overlay);
        this.annotationBox = annotationBox;
        // we need to capture over textarea
        this.targetElement.dataset.attachedTextCheckerElement = "true";
        this.targetElement.addEventListener("mousemove", this.onMouseUpdate);
        this.targetElement.addEventListener("focus", this.onFocus);
        this.targetElement.addEventListener("blur", this.onBlur);
        this.targetElement.addEventListener("mouseenter", this.onMouseEnter);
        this.targetElement.addEventListener("mouseleave", this.onMouseLeave);
        this.store.onChange(() => {
            this.renderAnnotationMarkers(this.store.get());
        });
    }

    disconnectedCallback() {
        this.targetElement.removeEventListener("mousemove", this.onMouseUpdate);
        this.targetElement.removeEventListener("focus", this.onFocus);
        this.targetElement.removeEventListener("blur", this.onBlur);
        this.targetElement.removeEventListener("mouseenter", this.onMouseEnter);
        this.targetElement.removeEventListener("mouseleave", this.onMouseLeave);
    }

    private onMouseEnter = () => {
        this.isHovering = true;
        this.onEnter?.();
    };

    private onMouseLeave = () => {
        this.isHovering = false;
        this.onLeave?.();
        this.resetHoverState();
    };

    resetAnnotations() {
        this.store.clear();
    }

    resetHoverState() {
        this.store.clearHoverState();
    }

    updateAnnotations(annotationItems: AnnotationItem[]) {
        const target = this.targetElement;
        const targetStyle = window.getComputedStyle(target);
        const copyAttributes = ["box-sizing"] as const;
        const copyStyle = copyAttributes
            .map((attr) => {
                return `${attr}: ${targetStyle.getPropertyValue(attr)};`;
            })
            .join("");
        this.annotationBox.setAttribute(
            "style",
            `color: transparent; overflow:hidden; position: absolute; pointer-events: none; ${copyStyle}`
        );
        // Ref: https://github.com/yuku/textoverlay
        // Outer position
        // update annotation box that align with target textarea
        // top-left (0,0)
        // read styles form target element
        const offsetTop = target.offsetTop;
        const offsetLeft = target.offsetLeft;
        const offsetHeight = target.offsetHeight;
        const offsetWidth =
            target.clientWidth +
            parseInt(targetStyle.borderLeftWidth || "0", 10) +
            parseInt(targetStyle.borderRightWidth || "0", 10);
        // const textareaScrollTop = target.scrollTop;
        const textareaZIndex = targetStyle.zIndex !== null && targetStyle.zIndex !== "auto" ? +targetStyle.zIndex : 0;
        // updates style
        this.annotationBox.style.zIndex = `${textareaZIndex + 1}`;
        this.annotationBox.style.left = `${offsetLeft}px`;
        this.annotationBox.style.top = `${offsetTop}px`;
        this.annotationBox.style.height = `${offsetHeight}px`;
        this.annotationBox.style.width = `${offsetWidth}px`;
        // box
        const fontSize: number = toPX(targetStyle.getPropertyValue("font-size")) ?? 16.123;
        const boxMarginTop: number = toPX(targetStyle.getPropertyValue("margin-top")) ?? 0;
        const boxMarginBottom: number = toPX(targetStyle.getPropertyValue("margin-bottom")) ?? 0;
        const boxBorderWidth: number = toPX(targetStyle.getPropertyValue("border-width")) ?? 0;
        const boxPaddingTop: number = toPX(targetStyle.getPropertyValue("padding-top")) ?? 0;
        const boxPaddingBottom: number = toPX(targetStyle.getPropertyValue("padding-bottom")) ?? 0;
        const boundingClientRect = target.getBoundingClientRect();
        const boxAbsoluteX: number = boundingClientRect.x;
        const boxAbsoluteY: number = boundingClientRect.y;
        const boxWidth: number = boundingClientRect.width;
        const boxHeight: number = boundingClientRect.height;
        // Inner position
        // textarea is scrollable element
        const visibleArea = {
            top: target.scrollTop,
            left: target.scrollLeft,
            width: boxWidth,
            height: boxHeight
        };
        this.annotationBox.scrollTop = target.scrollTop;
        this.annotationBox.scrollLeft = target.scrollLeft;
        // FIXME: more correct way
        // AnnotationItems should be sorted by range.
        // Because, drop non-visible rect items for performance.
        // Example)
        // ZYXWVUTSRQPONMLKJIHGFEDCBA
        // ^^^^^^^--------------------
        // visible    ^^^^^
        //          non-visible = drop from `rectItems`
        const annotationItemsByDescendingOrder = annotationItems.slice().reverse();
        let stopSearchAboveIsNotVisible = false;
        const rectItems = annotationItemsByDescendingOrder.flatMap((annotation) => {
            // already the annotation is not visible, skip it
            if (stopSearchAboveIsNotVisible) {
                return [];
            }
            const start = annotation.start;
            const end = annotation.end;
            // 0 start
            const startCoordinate = getCoordinates(this.targetElement, start, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: false
            });
            // Stop to search if out of visible
            if (startCoordinate.top + fontSize < visibleArea.top) {
                stopSearchAboveIsNotVisible = true;
                return [];
            }
            const endCoordinate = getCoordinates(this.targetElement, end, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: false
            });
            const rectItems: TextCheckerElementRectItem[] =
                startCoordinate.top === endCoordinate.top
                    ? [
                          {
                              id: annotation.id,
                              // left and top is visible position
                              // annotationBox(textarea) also scroll with same position of actual textarea
                              left: startCoordinate.left - visibleArea.left,
                              top: startCoordinate.top - visibleArea.top,
                              height: fontSize, //startCoordinate.height,
                              width: endCoordinate.left - startCoordinate.left,
                              boxMarginTop,
                              boxMarginBottom,
                              boxBorderWidth,
                              boxAbsoluteX,
                              boxAbsoluteY,
                              boxWidth,
                              boxHeight,
                              boxPaddingTop,
                              boxPaddingBottom
                          }
                      ]
                    : // two line
                      [
                          {
                              id: annotation.id,
                              left: startCoordinate.left - visibleArea.left,
                              top: startCoordinate.top - visibleArea.top,
                              height: fontSize, //startCoordinate.height,
                              width:
                                  (startCoordinate?._div?.getBoundingClientRect()?.width ?? 0) - startCoordinate.left,
                              boxMarginTop,
                              boxMarginBottom,
                              boxBorderWidth,
                              boxAbsoluteX,
                              boxAbsoluteY,
                              boxWidth,
                              boxHeight,
                              boxPaddingTop,
                              boxPaddingBottom
                          },
                          {
                              id: annotation.id,
                              left: -visibleArea.left,
                              top: endCoordinate.top - visibleArea.top,
                              height: fontSize,
                              width: (startCoordinate?._div?.getBoundingClientRect()?.left ?? 0) + endCoordinate.left,
                              boxMarginTop,
                              boxMarginBottom,
                              boxBorderWidth,
                              boxAbsoluteX,
                              boxAbsoluteY,
                              boxWidth,
                              boxHeight,
                              boxPaddingTop,
                              boxPaddingBottom
                          }
                      ];
            return rectItems;
        });
        this.store.update({
            annotationItems,
            rectItems
        });
    }

    renderAnnotationMarkers = (state: TextCheckerState) => {
        const items = state.rectItems.map((rect) => Marker(rect, state.highlightRectIdSet.has(rect.id)));
        render(items, this.annotationBox);
    };

    onFocus = () => {
        this.isFocus = true;
    };
    onBlur = () => {
        this.isFocus = false;
    };

    isHoverRectItem = (rectItem: TextCheckerElementRectItem): boolean => {
        const state = this.store.get();
        return Boolean(state.mouseHoverRectIdMap.get(rectItem.id));
    };

    onMouseUpdate = (event: MouseEvent) => {
        const state = this.store.get();
        const hoverPadding = this.hoverPadding;
        const isIncludedIndexes = state.rectItems
            .filter((rect) => {
                const point = {
                    x: event.clientX - rect.boxAbsoluteX,
                    y: event.clientY - rect.boxAbsoluteY
                };
                return (
                    rect.left - hoverPadding <= point.x &&
                    rect.left + rect.width + hoverPadding >= point.x &&
                    rect.top - hoverPadding <= point.y &&
                    rect.top + rect.height + hoverPadding >= point.y
                );
            })
            .map((item) => item.id);
        // call mouseover
        // naive implementation
        // TODO: https://github.com/mourner/flatbush is useful for search
        state.rectItems.forEach((rectItem) => {
            const isHoverRect = state.mouseHoverRectIdMap.get(rectItem.id);
            const isIncludedMouse = isIncludedIndexes.includes(rectItem.id);
            if (!isHoverRect && isIncludedMouse) {
                state.annotationItems
                    .find((item) => item.id === rectItem.id)
                    ?.onMouseEnter({
                        rectItem: rectItem
                    });
            } else if (isHoverRect && !isIncludedMouse) {
                state.annotationItems
                    .find((item) => item.id === rectItem.id)
                    ?.onMouseLeave({
                        rectItem: rectItem
                    });
            }
            state.mouseHoverRectIdMap.set(rectItem.id, isIncludedMouse);
        });
        // update highlight
        this.store.highlightRectIndexes(isIncludedIndexes);
    };
}

if (!window.customElements.get("text-checker-element")) {
    window.customElements.define("text-checker-element", TextCheckerElement);
}
