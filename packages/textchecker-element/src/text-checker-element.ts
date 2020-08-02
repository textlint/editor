import textCaretPos from "text-caret-pos";
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
    private hoverPadding: number;

    constructor(args: TextCheckerElementAttributes) {
        super();
        this.targetElement = args.targetElement;
        this.hoverPadding = args.hoverPadding;
        this.store = createTextCheckerStore();
    }

    connectedCallback(): void {
        const target = this.targetElement;
        if (!target) {
            throw new Error("target element is not found");
        }
        const shadow = this.attachShadow({ mode: "open" });
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.setAttribute(
            "style",
            "color: transparent; border: 1px dotted blue; position: absolute; top: 0px; left: 0px; pointer-events: none;"
        );
        const annotationBox = document.createElement("div");
        annotationBox.className = "annotationBox";
        overlay.append(annotationBox);
        shadow.append(overlay);
        this.annotationBox = annotationBox;
        this.targetElement.addEventListener("mousemove", this.onMouseUpdate);
        // when scroll the element, update annoation
        this.targetElement.addEventListener("scroll", this.updateOnScroll);
        this.store.onChange(() => {
            this.renderAnnotationMarkers(this.store.get());
        });
    }

    updateOnScroll = () => {};

    disconnectedCallback() {
        this.targetElement.removeEventListener("mousemove", this.onMouseUpdate);
        this.targetElement.removeEventListener("scroll", this.updateOnScroll);
    }

    resetAnnotations() {
        if (this.store.get().rectItems.length === 0) {
            return; // no update
        }
        this.store.update({
            rectItems: []
        });
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
        console.log({ offsetTop, offsetLeft, offsetHeight });
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
        const rectItems = annotationItems.flatMap((annotation, index) => {
            const start = annotation.start;
            const end = annotation.end;
            // 0 start
            const startCoordinate = textCaretPos.getCoordinates(this.targetElement, start, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: false
            });
            const endCoordinate = textCaretPos.getCoordinates(this.targetElement, end, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: false
            });
            const rectItems: TextCheckerElementRectItem[] =
                startCoordinate.top === endCoordinate.top
                    ? [
                          {
                              index,
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
                              index,
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
                              index,
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
        const items = state.rectItems.map((rect) => Marker(rect, state.highlightRectIdSet.has(rect.index)));
        render(items, this.annotationBox);
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
                    point.x <= rect.left + hoverPadding + rect.width &&
                    rect.top - hoverPadding <= point.y &&
                    point.y <= rect.top + rect.height + hoverPadding
                );
            })
            .map((item) => item.index);
        // call mouseover
        state.rectItems.forEach((item) => {
            const currentState = state.mouseHoverReactIdMap.get(item.index);
            const isIncludedMouse = isIncludedIndexes.includes(item.index);
            if (currentState === false && isIncludedMouse) {
                state.annotationItems[item.index]?.onMouseEnter({
                    rectItem: item
                });
            } else if (currentState === true && !isIncludedMouse) {
                state.annotationItems[item.index]?.onMouseLeave({
                    rectItem: item
                });
            }
            state.mouseHoverReactIdMap.set(item.index, isIncludedMouse);
        });
        // update highlight
        this.store.highlightRectIndexes(isIncludedIndexes);
    };
}

if (!window.customElements.get("text-checker-element")) {
    window.customElements.define("text-checker-element", TextCheckerElement);
}
