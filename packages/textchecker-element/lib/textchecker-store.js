"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextCheckerElement = void 0;
const text_caret_pos_1 = __importDefault(require("text-caret-pos"));
const lit_html_1 = require("lit-html");
const Marker = (rect, isHighLight = false) => {
    if (isHighLight) {
        return lit_html_1.html`<span style="pointer-events: none; border: 2px dotted red; position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"></span>`;
    } else {
        return lit_html_1.html`<span style="pointer-events: none; border-bottom: 2px dotted red; position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"></span>`;
    }
};
class TextCheckerElement extends HTMLElement {
    constructor(args) {
        super();
        this.mouseStateMap = new Map();
        this.rectItems = [];
        this.annotationItems = [];
        this.renderAnnotationMarkers = ({ rectItems, highlightAnnotationItems = [] }) => {
            const items = rectItems.map((rect) => Marker(rect, !!highlightAnnotationItems[rect.index]));
            lit_html_1.render(items, this.annotationBox);
        };
        this.updateAnnotationRectItems = (annotationItems, rectItems) => {
            this.annotationItems = annotationItems;
            this.rectItems = rectItems;
        };
        this.onMouseUpdate = (event) => {
            var _a, _b;
            const clientRect =
                (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) !==
                    null && _b !== void 0
                    ? _b
                    : {
                          left: 0,
                          top: 0
                      };
            const point = {
                x: event.clientX - clientRect.left,
                y: event.clientY - clientRect.top
            };
            const isIncludedIndexes = this.rectItems
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
            this.rectItems.forEach((item) => {
                var _a, _b;
                const currentState = this.mouseStateMap.get(item.index);
                const isIncludedMouse = isIncludedIndexes.includes(item.index);
                if (currentState === false && isIncludedMouse) {
                    (_a = this.annotationItems[item.index]) === null || _a === void 0 ? void 0 : _a.onMouseEnter();
                } else if (currentState === true && !isIncludedMouse) {
                    (_b = this.annotationItems[item.index]) === null || _b === void 0 ? void 0 : _b.onMouseLeave();
                }
                this.mouseStateMap.set(item.index, isIncludedMouse);
            });
            // update highlight
            const highlightAnnotationItems = this.annotationItems.filter((_, index) => {
                return isIncludedIndexes.includes(index);
            });
            this.renderAnnotationMarkers({
                rectItems: this.rectItems,
                highlightAnnotationItems: highlightAnnotationItems
            });
        };
        this.target = args.target;
    }
    connectedCallback() {
        const targetSelector = this.target;
        if (!targetSelector) {
            throw new Error("target attribute should be defined");
        }
        const target = document.querySelector(targetSelector);
        if (!target) {
            throw new Error("target element is not found");
        }
        this.targetElement = target;
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
    }
    updateAnnotations(annotationItems) {
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
        ];
        const copyStyle = copyAttributes
            .map((attr) => {
                return `${attr}: ${targetStyle.getPropertyValue(attr)};`;
            })
            .join("");
        this.annotationBox.setAttribute("style", copyStyle + "pointer-events: none;");
        //
        const rectItems = annotationItems.flatMap((annotation, index) => {
            var _a, _b, _c, _d, _e, _f;
            const start = annotation.start;
            const end = annotation.end;
            // 0 start
            const startCoordinate = text_caret_pos_1.default.getCoordinates(this.targetElement, start, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: true
            });
            const endCoordinate = text_caret_pos_1.default.getCoordinates(this.targetElement, end, {
                reuse: true,
                returnHeight: true,
                returnDiv: true,
                debug: true
            });
            const fontSize = Number(targetStyle.getPropertyValue("font-size").replace("px", ""));
            const rectItems =
                startCoordinate.top === endCoordinate.top
                    ? [
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
                              height: fontSize,
                              width: endCoordinate.left - startCoordinate.left
                          }
                      ]
                    : // two line
                      [
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                              top: target.offsetTop - target.scrollTop + startCoordinate.top,
                              height: fontSize,
                              width:
                                  ((_c =
                                      (_b =
                                          (_a =
                                              startCoordinate === null || startCoordinate === void 0
                                                  ? void 0
                                                  : startCoordinate._div) === null || _a === void 0
                                              ? void 0
                                              : _a.getBoundingClientRect()) === null || _b === void 0
                                          ? void 0
                                          : _b.width) !== null && _c !== void 0
                                      ? _c
                                      : 0) - startCoordinate.left
                          },
                          {
                              index,
                              left: target.offsetLeft - target.scrollLeft,
                              top: target.offsetTop - target.scrollTop + endCoordinate.top,
                              height: fontSize,
                              width:
                                  ((_f =
                                      (_e =
                                          (_d =
                                              startCoordinate === null || startCoordinate === void 0
                                                  ? void 0
                                                  : startCoordinate._div) === null || _d === void 0
                                              ? void 0
                                              : _d.getBoundingClientRect()) === null || _e === void 0
                                          ? void 0
                                          : _e.left) !== null && _f !== void 0
                                      ? _f
                                      : 0) + endCoordinate.left
                          }
                      ];
            return rectItems;
        });
        this.renderAnnotationMarkers({ rectItems: rectItems });
        this.updateAnnotationRectItems(annotationItems, rectItems);
    }
}
exports.TextCheckerElement = TextCheckerElement;
if (!window.customElements.get("textchecker-element")) {
    window.CustomElementElement = TextCheckerElement;
    window.customElements.define("textchecker-element", TextCheckerElement);
}
//# sourceMappingURL=textchecker-store.js.map
