import textCaretPos from "text-caret-pos";
import { html, render } from "lit-html";
import { AnnotationItem, createTextCheckerStore, RectItem, TextCheckerState } from "./textchecker-store";

export type TextCheckerElementAttributes = {
    targetElement: HTMLTextAreaElement;
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

    constructor(args: TextCheckerElementAttributes) {
        super();
        this.targetElement = args.targetElement;
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
        //
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
            const fontSize = Number(targetStyle.getPropertyValue("font-size").replace("px", ""));
            const rectItems: RectItem[] =
                startCoordinate.top === endCoordinate.top
                    ? [
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
                              height: fontSize, //startCoordinate.height,
                              width: endCoordinate.left - startCoordinate.left
                          }
                      ]
                    : // two line
                      [
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
                              height: fontSize, //startCoordinate.height,
                              width: (startCoordinate?._div?.getBoundingClientRect()?.width ?? 0) - startCoordinate.left
                          },
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft,
                              top: target.offsetTop - target.scrollTop + endCoordinate.top,
                              height: fontSize,
                              width: (startCoordinate?._div?.getBoundingClientRect()?.left ?? 0) + endCoordinate.left
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
        const clientRect = (event.currentTarget as HTMLTextAreaElement)?.getBoundingClientRect() ?? {
            left: 0,
            top: 0
        };
        const point = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };
        const state = this.store.get();
        const isIncludedIndexes = state.rectItems
            .filter((rect) => {
                return (
                    rect.left <= point.x &&
                    point.x <= rect.left + rect.width &&
                    rect.top <= point.y &&
                    point.y <= rect.top + rect.height
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
