import textCaretPos from "text-caret-pos";
import { html, render } from "lit-html";
import { AnnotationItem, createTextCheckerStore, RectItem, TextCheckerState } from "./textchecker-store";

const toPX = require("to-px");
export type TextCheckerElementAttributes = {
    targetElement: HTMLTextAreaElement;
    hoverPadding: number;
};
const Marker = (rect: RectItem, isHighLight: boolean = false) => {
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
        overlay.setAttribute(
            "style",
            "border: 1px dotted blue; position: absolute; top: 0px; left: 0px; pointer-events: none;"
        );
        const annotationBox = document.createElement("div");
        overlay.append(annotationBox);
        shadow.append(overlay);
        this.annotationBox = annotationBox;
        this.targetElement.addEventListener("mousemove", this.onMouseUpdate);
        this.store.onChange(() => {
            this.renderAnnotationMarkers(this.store.get());
        });
    }

    updateAnnotations(annotationItems: AnnotationItem[]) {
        const target = this.targetElement;
        const targetStyle = window.getComputedStyle(target);
        const copyAttributes = [
            "box-sizing",
            "top",
            "left",
            "width",
            "height",
            "position",
            "pointer-events",
            "overflow",
            "border",
            "border-radius",
            "padding",
            "margin"
        ] as const;
        const copyStyle = copyAttributes
            .map((attr) => {
                return `${attr}: ${targetStyle.getPropertyValue(attr)};`;
            })
            .join("");
        this.annotationBox.setAttribute("style", copyStyle + "pointer-events: none;");
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
            const rectItems: RectItem[] =
                startCoordinate.top === endCoordinate.top
                    ? [
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
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
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
                              height: fontSize, //startCoordinate.height,
                              width:
                                  (startCoordinate?._div?.getBoundingClientRect()?.width ?? 0) - startCoordinate.left,
                              boxMarginTop,
                              boxMarginBottom,
                              boxBorderWidth,
                              boxAbsoluteX,
                              boxAbsoluteY,
                              boxWidth,
                              boxHeight
                          },
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft,
                              top: target.offsetTop - target.scrollTop + endCoordinate.top,
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
