/**
 * MIT License
 * Copyright (C) 2017-2018 DFKI GmbH
 *
 *
 * based on:
 *
 * https://github.com/component/textarea-caret-position
 * MIT License
 * Copyright (c) 2015 Jonathan Ong me@jongleberry.com
 *
 */
//	The properties that we copy into a mirrored div.
//	Note that some browsers, such as Firefox,
//	do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
//	so we have to do every single property specifically.
var properties = [
    "direction", // RTL support
    "boxSizing",
    "width", // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    "height",
    "overflowX",
    "overflowY", // copy the scrollbar for IE

    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderStyle",

    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",

    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration", // might not make a difference, but better be safe

    "letterSpacing",
    "wordSpacing",

    "tabSize",
    "MozTabSize"
];

//MOD for ensuring faux span uses correct styles
var spanProperties = [
    { n: "direction", v: "inherit" }, // RTL support
    { n: "boxSizing", v: "inherit" },

    { n: "width", v: "auto" },
    { n: "height", v: "auto" },
    { n: "height", v: "auto" },
    { n: "borderTopWidth", v: "0px" },
    { n: "borderRightWidth", v: "0px" },
    { n: "borderBottomWidth", v: "0px" },
    { n: "borderLeftWidth", v: "0px" },
    { n: "borderStyle", v: "none" },

    { n: "paddingTop", v: "0px" },
    { n: "paddingRight", v: "0px" },
    { n: "paddingBottom", v: "0px" },
    { n: "paddingLeft", v: "0px" },
    { n: "marginTop", v: "0px" },
    { n: "maringRight", v: "0px" },
    { n: "maringBottom", v: "0px" },
    { n: "maringLeft", v: "0px" },

    { n: "fontStyle", v: "inherit" },
    { n: "fontVariant", v: "inherit" },
    { n: "fontWeight", v: "inherit" },
    { n: "fontStretch", v: "inherit" },
    { n: "fontSize", v: "inherit" },
    { n: "fontSizeAdjust", v: "inherit" },
    { n: "lineHeight", v: "inherit" },
    { n: "fontFamily", v: "inherit" },

    { n: "textAlign", v: "inherit" },
    { n: "textTransform", v: "inherit" },
    { n: "textIndent", v: "inherit" },
    { n: "textDecoration", v: "inherit" }, // might not make a difference, but better be safe

    { n: "letterSpacing", v: "inherit" },
    { n: "wordSpacing", v: "inherit" },

    { n: "tabSize", v: "inherit" }
];

var isBrowser = typeof window !== "undefined";
var isFirefox = isBrowser && global.mozInnerScreenX != null;

var _getComputedStyle = global.getComputedStyle
    ? global.getComputedStyle
    : function (element) {
          // currentStyle for IE < 9
          return element.currentStyle;
      };

var lastStyleTargetType;

function createCaretCoordinatesDiv(options) {
    var id = (options && options.id) || "input-textarea-caret-position-mirror-div";
    var debug = (options && options.debug) || false;
    var reuse = debug || (options && options.reuse) || false;
    var div;
    if (reuse) {
        div = document.getElementById(id);
    }
    if (!div) {
        div = document.createElement("div");
        div.id = id;
        document.body.appendChild(div);
        lastStyleTargetType = void 0; //since DIV is newly created: "reset" any cached values
    }
    return div;
}

/**
 * In some environments, a font-zoom my be active, e.g. on Android accessibility settings
 * may increase the font-size, so that applying the measured font-size will actually be
 * zoomed (again).
 *
 * This function tests, if the applied font-size is equal to the measured/computed one and
 * returns the factor, i.e.
 *   1: not zoomed
 * < 1: decreased font-size (zoom-out)
 * > 1: increased font-size (zoom-in)
 *
 * @returns {number} the zoom-factor for font-size
 */
function measureFontZoom() {
    var span = document.createElement("span");
    var style = span.style;
    // position off-screen
    style.position = "absolute"; // required to return coordinates properly
    // if (!debug)
    style.visibility = "hidden"; // not 'display: none' because we want rendering

    style.fontSize = "100px";

    document.body.appendChild(span);

    var measured = parseFloat(_getComputedStyle(span).getPropertyValue("font-size"));
    if (span.parentNode !== null) {
        //<- just to be save, but the span should have been attached to body
        span.parentNode.removeChild(span);
    }

    return isFinite(measured) ? measured / 100 : 1;
}

function styleCaretCoordinatesDiv(element, position, div, options) {
    var debug = (options && options.debug) || false;
    var reuse = debug || (options && options.reuse) || false;
    if (reuse) {
        var forceUpdateStyle = (options && options.forceUpdateStyle) || false;
        if (!forceUpdateStyle && options && !options.reuse) {
            //if not option "reuse": do force update styling (since DIV is newly created)
            forceUpdateStyle = true;
        }

        var guessIfUpdateStyle;
        if (!forceUpdateStyle) {
            guessIfUpdateStyle = (options && options.guessIfUpdateStyle) || false;
        } else {
            guessIfUpdateStyle = false;
        }

        //try to guess, if updating styles is necessary (only works, if text-input elements of the same type are styled the same)
        if (guessIfUpdateStyle) {
            if (
                (typeof guessIfUpdateStyle === "function" && !guessIfUpdateStyle(div)) ||
                lastStyleTargetType === element.tagName
            ) {
                return; ////////////// EARLY EXIT ///////////////////////
            }
        }

        lastStyleTargetType = element.tagName;
    } else {
        lastStyleTargetType = void 0;
    }

    var style = div.style;
    var computed = _getComputedStyle(element);

    var isInput = element.nodeName === "INPUT"; //MODIFICATION: adjust lineHeight for INPUT

    // default textarea styles
    style.whiteSpace = "pre-wrap";
    if (!isInput) style.wordWrap = "break-word";
    // only for textarea-s
    else if (!options || !options.allowInputWrap) style.wordWrap = "normal"; // explicitly reset wordWrap to avoid interference from inheriting style etc

    // position off-screen
    style.position = "absolute"; // required to return coordinates properly
    if (!debug) style.visibility = "hidden"; // not 'display: none' because we want rendering

    if (options && options.fontZoom === true) {
        options.fontZoom = 1 / measureFontZoom();
    }

    // transfer the element's properties to the div
    var propList = options && options.additionalStyles ? properties.concat(options.additionalStyles) : properties;
    propList.forEach(function (prop) {
        if (isInput && prop === "lineHeight") {
            //MODIFICATION: for INPUT the text is rendered centered -> set lineHeight equal to computed height, if element is larger than the lineHeight
            //MODIFICATION: if "normal" lineHeight, force value:
            var cc = computed;
            if (computed["lineHeight"] === "normal") {
                style["lineHeight"] = "1em";
                style["height"] = computed["height"];
                cc = _getComputedStyle(div);
            }
            //console.log('height: '+computed['height']+', lineHeight: '+cc['lineHeight']);
            if (computed.boxSizing === "border-box") {
                var height = parseInt(computed.height);
                var outerHeight =
                    parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                var targetHeight = outerHeight + parseInt(cc.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + "px";
                } else if (height === targetHeight) {
                    style.lineHeight = cc.lineHeight;
                } else {
                    style.lineHeight = 0;
                }
            } else {
                var ch,
                    clh,
                    th,
                    oh = 0;
                if (isFinite((clh = parseFloat(cc["lineHeight"]))) && isFinite((ch = parseFloat(computed["height"])))) {
                    ["borderTop", "borderBottom", "paddingTop", "paddingBottom", "marginTop", "marginBottom"].forEach(
                        function (n) {
                            //TODO consider boxSizing?
                            th = parseFloat(computed[n]);
                            if (isFinite(th)) {
                                oh += th;
                            }
                        }
                    );
                    // if(ch > clh){
                    if (oh === 0) style["lineHeight"] = computed["height"];
                    else {
                        th = Math.max(ch - oh, 0);
                        style["lineHeight"] = (th > 0 ? th : ch) + "px";
                    }
                    // } else {
                    // 	style['lineHeight'] = (ch - (clh-ch))+'px';
                    // }
                } else {
                    style[prop] = cc[prop];
                }
            }
        } else if (options && typeof options.fontZoom === "number" && (prop === "fontSize" || prop === "lineHeight")) {
            //MODIFICATION: option for applying zoom-factor to font-size & line-height
            var fsize;
            if (isFinite((fsize = parseFloat(computed[prop])))) {
                style[prop] = fsize * options.fontZoom + "px";
            } else {
                style[prop] = computed[prop];
            }
        } else {
            style[prop] = computed[prop];
        }
    });

    if (isFirefox) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        if (element.scrollHeight > parseInt(computed.height)) style.overflowY = "scroll";
    } else {
        style.overflow = "hidden"; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }
}

//	HELPER: reset any cached value (i.e. force re-styling in next invocation)
function resetStyleCaretCoordinatesDiv() {
    lastStyleTargetType = void 0;
}

// HELPER: remove reused faux DIV if present
function resetCaretCoordinatesDiv(options) {
    var id = (options && options.id) || "input-textarea-caret-position-mirror-div";
    var div = document.getElementById(id);
    if (div) {
        document.body.removeChild(div);
    }
}

function getText(element, options) {
    if (options) {
        if (options.text) {
            if (typeof options.text === "function") {
                return options.text(element, options);
            }
            return options.text;
        }
    }
    return element.value;
}

const createCachedComputedStyle = () => {
    let prevValue = "";
    let prevComputedStyle = null;
    /**
     * @type {HTMLTextAreaElement}
     */
    return (element) => {
        const newValue = element.value;
        if (prevValue === newValue) {
            return prevComputedStyle;
        }
        prevValue = newValue;
        prevComputedStyle = _getComputedStyle(element);
        return prevComputedStyle;
    };
};
const cachedComputedStyle = createCachedComputedStyle();
function updateCaretCoordinates(element, position, div, options) {
    if (element.scrollLeft) div.scrollLeft = element.scrollLeft;

    if (element.scrollTop) div.scrollTop = element.scrollTop;

    if (element.dir) div.dir = element.dir;

    if (options && options.additionalAttributes) {
        options.additionalAttributes.forEach(function (attr) {
            div[attr] = element[attr];
        });
    }

    var computed = cachedComputedStyle(element);
    var isInput = element.nodeName === "INPUT";

    div.textContent = getText(element, options).substring(0, position);
    // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (isInput && (!options || !options.allowInputWrap)) div.textContent = div.textContent.replace(/\s/g, "\u00a0");

    var span = document.createElement("span");
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // for inputs, just '.' would be enough, but why bother?
    span.textContent = getText(element, options).substring(position) || "."; // || because a completely empty faux span doesn't render at all

    //set ID for faux span?
    if (options.fauxId) {
        span.id = options.fauxId;
    }

    // force span to inherit from shadow DIV
    if (options.forceClearFauxStyle) {
        var spanStyle = span.style;
        spanProperties.forEach(function (prop) {
            spanStyle[prop.n] = prop.v;
        });
    }

    div.appendChild(span);

    var coordinates = {
        top: span.offsetTop + parseInt(computed["borderTopWidth"]),
        left: span.offsetLeft + parseInt(computed["borderLeftWidth"]),
        height: parseInt(computed["lineHeight"])
    };

    if (options && options.returnHeight) {
        coordinates.height = span.offsetHeight;
    }

    return coordinates;
}

/**
 * @param {HTMLInput | HTMLTextArea} element
 *                the HTML text control for which to determine the coordinates
 * @param {Number} position
 *                the index of the character (within the text of the text-control) where the caret should appear
 * @param {PlainObject} [options] OPTIONAL
 *                options for calculating the caret coordinates:
 *                options.reuse    BOOLEAN: reuse shadow DIV that is used for calculating the caret coordinates (DEFAULT: false)
 *                options.returnDiv    BOOLEAN: if reuse was enabled, returns the shadow DIV in the coordinates-object in property <code>_div</code> (DEFAULT: false)
 *                options.returnHeight    BOOLEAN: returns the caret height in the returned coordinates-object in property <code>height</code> (DEFAULT: false)
 *                options.id        STRING: the id attribute for the shadow DIV (DEFAULT: "input-textarea-caret-position-mirror-div")
 *                options.guessIfUpdateStyle    BOOLEAN | FUNCTION: if TRUE, styling of the shadow DIV is not updated, if the current target element has the same type (Tag Name) as the previous one.
 *                                                                If function: a callback for determining, if the shadow DIV's style should be updated (return TRUE, if it should get updated): callback(shadowDiv) : boolean
 *                                                                NOTE this option is only relevant, if "reuse" is TRUE.
 *                                                                (DEFAULT: false)
 *                options.forceUpdateStyle    BOOLEAN: force updating the style of the shadow DIV; only relevant, if "reuse" is TRUE (DEFAULT: false)
 *                options.forceClearFauxStyle    BOOLEAN: force faux span to use "cleared" style (e.g. in case SPAN is globally styled) (DEFAULT: false)
 *                options.fauxId                STRING: use ID for faux span (e.g. for styling faux span) (DEFAULT: undefined)
 *                options.fontZoom            NUMBER | BOOLEAN: apply zoom factor to font-size.
 *                                                             If <code>true</code> (boolean) the zoom factor will be calculated using measureFontZoom(), and the option-value
 *                                                             (<code>true</code>) will be replaced with the measured zoom factor.
 *                                                             (DEFAULT: undefined)
 *
 *                options.allowInputWrap    BOOLEAN: if TRUE, allows text-wrapping for INPUT elements (note: the W3C specifically states that text in INPUT will not be wrapped, even if styles would "request" it, like "word-wrap: break-word" or "word-break: break-all | break-word" or similar)
 *                                                                (DEFAULT: false)
 *                options.additionalStyles    ARRAY<STRING>: transfers additional styles properties from the target element to the shadow DIV
 *                options.additionalAttributes    ARRAY<STRING>: transfers additional (node) attributes from the target element to the shadow DIV
 *
 *
 *                options.text STRING | FUNCTION: the text value that should be used for the calculation.
 *                                                             If function: a callback which's return value is used as the text: <code>callback(element, options) : string</code>
 *
 */
function getCaretCoordinates(element, position, options) {
    if (!isBrowser) {
        throw new Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");
    }

    var debug = (options && options.debug) || false;

    var reuse = debug || (options && options.reuse) || false;

    // mirrored div
    var div = createCaretCoordinatesDiv(options);

    styleCaretCoordinatesDiv(element, position, div, options);

    var coordinates = updateCaretCoordinates(element, position, div, options);

    if (debug) {
        //TODO support styling for mirror elements
        div.style.backgroundColor = "#aaa";
        coordinates._div = div;
    }

    var returnDiv = options && options.returnDiv;
    if (!reuse && !returnDiv) {
        resetStyleCaretCoordinatesDiv();
        document.body.removeChild(div);
    } else if (returnDiv) {
        coordinates._div = div;
    }

    return coordinates;
}

export {
    createCaretCoordinatesDiv,
    measureFontZoom,
    styleCaretCoordinatesDiv,
    resetStyleCaretCoordinatesDiv,
    updateCaretCoordinates,
    getCaretCoordinates as getCoordinates
};
