import textCaretPos from "text-caret-pos";
class TextCheckerElement extends HTMLElement {
    constructor(args) {
        super();
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
    }
    updateAnnotations(annotations) {
        var _a, _b, _c, _d, _e, _f;
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
        const start = annotations[0].start;
        const end = annotations[0].end;
        // 0 start
        const startCoordinate = textCaretPos.getCoordinates(this.targetElement, start, {
            reuse: true,
            returnHeight: true,
            returnDiv: true,
            debug: true
        });
        const endCoordinate = textCaretPos.getCoordinates(this.targetElement, end, {
            reuse: true,
            returnHeight: true,
            returnDiv: true,
            debug: true
        });
        const fontSize = targetStyle.getPropertyValue("font-size").replace("px", "");
        const rectList =
            startCoordinate.top === endCoordinate.top
                ? [
                      {
                          left: target.offsetLeft - target.scrollLeft + startCoordinate.left,
                          top: target.offsetTop - target.scrollTop + startCoordinate.top,
                          height: fontSize,
                          width: endCoordinate.left - startCoordinate.left
                      }
                  ]
                : // two line
                  [
                      {
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
        this.annotationBox.innerHTML = rectList
            .map((rect) => {
                return `<span style="border-bottom: 2px dotted red; position: absolute; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"></span>`;
            })
            .join("\n");
    }
}
export { TextCheckerElement };
if (!window.customElements.get("textchecker-element")) {
    window.CustomElementElement = TextCheckerElement;
    window.customElements.define("textchecker-element", TextCheckerElement);
}
//# sourceMappingURL=textchecker-element.js.map
