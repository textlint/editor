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
        const shadow = this.attachShadow({mode: "open"});
        const overlay = document.createElement("div");
        overlay.setAttribute(
            "style",
            "color: transparent; border: 1px dotted blue; overflow: hidden; position: absolute; top: 0px; left: 0px; pointer-events: none;"
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
            "overflow",
        ] as const;
        const copyStyle = copyAttributes
            .map((attr) => {
                return `${attr}: ${targetStyle.getPropertyValue(attr)};`;
            })
            .join("");
        this.annotationBox.setAttribute("style", `color: transparent; overflow: hidden; position: absolute; pointer-events: none; ${copyStyle}`)
        // Ref: https://github.com/yuku/textoverlay
        // update annotation box that align with target textarea
        // top-left (0,0)
        // read styles form target element
        const top = target.offsetTop;
        const left = target.offsetLeft;
        const height = target.offsetHeight;
        const width = target.clientWidth +
            parseInt(targetStyle.borderLeftWidth || '0', 10) +
            parseInt(targetStyle.borderRightWidth || '0', 10);
        // const textareaScrollTop = target.scrollTop;
        const textareaZIndex = targetStyle.zIndex !== null &&
        targetStyle.zIndex !== 'auto'
            ? +targetStyle.zIndex :
            0;
        // updates style
        this.annotationBox.style.zIndex = `${textareaZIndex + 1}`;
        this.annotationBox.style.left = `${left}px`;
        this.annotationBox.style.top = `${top}px`;
        this.annotationBox.style.height = `${height}px`;
        this.annotationBox.style.width = `${width}px`;
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
                            left: startCoordinate.left,
                            top: startCoordinate.top,
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
                            left: startCoordinate.left,
                            top: startCoordinate.top,
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
                            left: 0,
                            top: endCoordinate.top,
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
