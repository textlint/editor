// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
    // Save the require from previous bundle to this closure if any
    var previousRequire = typeof parcelRequire === "function" && parcelRequire;
    var nodeRequire = typeof require === "function" && require;

    function newRequire(name, jumped) {
        if (!cache[name]) {
            if (!modules[name]) {
                // if we cannot find the module within our internal map or
                // cache jump to the current global require ie. the last bundle
                // that was added to the page.
                var currentRequire = typeof parcelRequire === "function" && parcelRequire;
                if (!jumped && currentRequire) {
                    return currentRequire(name, true);
                }

                // If there are other bundles on this page the require from the
                // previous one is saved to 'previousRequire'. Repeat this as
                // many times as there are bundles until the module is found or
                // we exhaust the require chain.
                if (previousRequire) {
                    return previousRequire(name, true);
                }

                // Try the node require function if it exists.
                if (nodeRequire && typeof name === "string") {
                    return nodeRequire(name);
                }

                var err = new Error("Cannot find module '" + name + "'");
                err.code = "MODULE_NOT_FOUND";
                throw err;
            }

            localRequire.resolve = resolve;
            localRequire.cache = {};

            var module = (cache[name] = new newRequire.Module(name));

            modules[name][0].call(module.exports, localRequire, module, module.exports, this);
        }

        return cache[name].exports;

        function localRequire(x) {
            return newRequire(localRequire.resolve(x));
        }

        function resolve(x) {
            return modules[name][1][x] || x;
        }
    }

    function Module(moduleName) {
        this.id = moduleName;
        this.bundle = newRequire;
        this.exports = {};
    }

    newRequire.isParcelRequire = true;
    newRequire.Module = Module;
    newRequire.modules = modules;
    newRequire.cache = cache;
    newRequire.parent = previousRequire;
    newRequire.register = function (id, exports) {
        modules[id] = [
            function (require, module) {
                module.exports = exports;
            },
            {}
        ];
    };

    var error;
    for (var i = 0; i < entry.length; i++) {
        try {
            newRequire(entry[i]);
        } catch (e) {
            // Save first error but execute all entries
            if (!error) {
                error = e;
            }
        }
    }

    if (entry.length) {
        // Expose entry point to Node, AMD or browser globals
        // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
        var mainExports = newRequire(entry[entry.length - 1]);

        // CommonJS
        if (typeof exports === "object" && typeof module !== "undefined") {
            module.exports = mainExports;

            // RequireJS
        } else if (typeof define === "function" && define.amd) {
            define(function () {
                return mainExports;
            });

            // <script>
        } else if (globalName) {
            this[globalName] = mainExports;
        }
    }

    // Override the current require with this new one
    parcelRequire = newRequire;

    if (error) {
        // throw error from earlier, _after updating parcelRequire_
        throw error;
    }

    return newRequire;
})(
    {
        "../../../node_modules/text-caret-pos/dist/textCaretPos.js": [
            function (require, module, exports) {
                var define;
                var global = arguments[3];

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

                /* jshint browser: true */

                (function (root, factory) {
                    if (typeof define === "function" && define.amd) {
                        // AMD. Register as an anonymous module.
                        define(function () {
                            return factory(root);
                        });
                    } else if (typeof module === "object" && module.exports) {
                        // Node. Does not work with strict CommonJS, but
                        // only CommonJS-like environments that support module.exports,
                        // like Node.
                        module.exports = factory(root);
                    } else {
                        // Browser globals
                        root.textCaretPos = factory(root);
                    }
                })(typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : this, function (
                    global
                ) {
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
                        var propList =
                            options && options.additionalStyles
                                ? properties.concat(options.additionalStyles)
                                : properties;
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
                                    if (
                                        isFinite((clh = parseFloat(cc["lineHeight"]))) &&
                                        isFinite((ch = parseFloat(computed["height"])))
                                    ) {
                                        [
                                            "borderTop",
                                            "borderBottom",
                                            "paddingTop",
                                            "paddingBottom",
                                            "marginTop",
                                            "marginBottom"
                                        ].forEach(function (n) {
                                            //TODO consider boxSizing?
                                            th = parseFloat(computed[n]);
                                            if (isFinite(th)) {
                                                oh += th;
                                            }
                                        });
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
                            } else if (
                                options &&
                                typeof options.fontZoom === "number" &&
                                (prop === "fontSize" || prop === "lineHeight")
                            ) {
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

                    function updateCaretCoordinates(element, position, div, options) {
                        if (element.scrollLeft) div.scrollLeft = element.scrollLeft;

                        if (element.scrollTop) div.scrollTop = element.scrollTop;

                        if (element.dir) div.dir = element.dir;

                        if (options && options.additionalAttributes) {
                            options.additionalAttributes.forEach(function (attr) {
                                div[attr] = element[attr];
                            });
                        }

                        var computed = _getComputedStyle(element);
                        var isInput = element.nodeName === "INPUT";

                        div.textContent = getText(element, options).substring(0, position);
                        // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
                        if (isInput && (!options || !options.allowInputWrap))
                            div.textContent = div.textContent.replace(/\s/g, "\u00a0");

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
                     * 				the HTML text control for which to determine the coordinates
                     * @param {Number} position
                     * 				the index of the character (within the text of the text-control) where the caret should appear
                     * @param {PlainObject} [options] OPTIONAL
                     * 				options for calculating the caret coordinates:
                     * 				options.reuse	BOOLEAN: reuse shadow DIV that is used for calculating the caret coordinates (DEFAULT: false)
                     * 				options.returnDiv	BOOLEAN: if reuse was enabled, returns the shadow DIV in the coordinates-object in property <code>_div</code> (DEFAULT: false)
                     * 				options.returnHeight	BOOLEAN: returns the caret height in the returned coordinates-object in property <code>height</code> (DEFAULT: false)
                     * 				options.id		STRING: the id attribute for the shadow DIV (DEFAULT: "input-textarea-caret-position-mirror-div")
                     * 				options.guessIfUpdateStyle	BOOLEAN | FUNCTION: if TRUE, styling of the shadow DIV is not updated, if the current target element has the same type (Tag Name) as the previous one.
                     * 																If function: a callback for determining, if the shadow DIV's style should be updated (return TRUE, if it should get updated): callback(shadowDiv) : boolean
                     * 																NOTE this option is only relevant, if "reuse" is TRUE.
                     * 																(DEFAULT: false)
                     * 				options.forceUpdateStyle	BOOLEAN: force updating the style of the shadow DIV; only relevant, if "reuse" is TRUE (DEFAULT: false)
                     * 				options.forceClearFauxStyle	BOOLEAN: force faux span to use "cleared" style (e.g. in case SPAN is globally styled) (DEFAULT: false)
                     * 				options.fauxId				STRING: use ID for faux span (e.g. for styling faux span) (DEFAULT: undefined)
                     * 				options.fontZoom			NUMBER | BOOLEAN: apply zoom factor to font-size.
                     * 															 If <code>true</code> (boolean) the zoom factor will be calculated using measureFontZoom(), and the option-value
                     * 															 (<code>true</code>) will be replaced with the measured zoom factor.
                     * 															 (DEFAULT: undefined)
                     *
                     * 				options.allowInputWrap	BOOLEAN: if TRUE, allows text-wrapping for INPUT elements (note: the W3C specifically states that text in INPUT will not be wrapped, even if styles would "request" it, like "word-wrap: break-word" or "word-break: break-all | break-word" or similar)
                     * 																(DEFAULT: false)
                     * 				options.additionalStyles	ARRAY<STRING>: transfers additional styles properties from the target element to the shadow DIV
                     * 				options.additionalAttributes	ARRAY<STRING>: transfers additional (node) attributes from the target element to the shadow DIV
                     *
                     *
                     * 				options.text STRING | FUNCTION: the text value that should be used for the calculation.
                     * 															 If function: a callback which's return value is used as the text: <code>callback(element, options) : string</code>
                     *
                     */
                    function getCaretCoordinates(element, position, options) {
                        if (!isBrowser) {
                            throw new Error(
                                "textarea-caret-position#getCaretCoordinates should only be called in a browser"
                            );
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

                    return {
                        createDiv: createCaretCoordinatesDiv,
                        measureFontZoom: measureFontZoom,
                        styleDiv: styleCaretCoordinatesDiv,
                        resetStyleDiv: resetStyleCaretCoordinatesDiv,
                        resetDiv: resetCaretCoordinatesDiv,
                        updateCoordinates: updateCaretCoordinates,
                        getCoordinates: getCaretCoordinates
                    };
                });
            },
            {}
        ],
        "../../../node_modules/text-caret-pos/index.js": [
            function (require, module, exports) {
                var textCaretPos = require("./dist/textCaretPos.js");

                module.exports = textCaretPos;
            },
            { "./dist/textCaretPos.js": "../../../node_modules/text-caret-pos/dist/textCaretPos.js" }
        ],
        "../../../node_modules/lit-html/lib/directive.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.isDirective = exports.directive = void 0;

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */
                const directives = new WeakMap();
                /**
                 * Brands a function as a directive factory function so that lit-html will call
                 * the function during template rendering, rather than passing as a value.
                 *
                 * A _directive_ is a function that takes a Part as an argument. It has the
                 * signature: `(part: Part) => void`.
                 *
                 * A directive _factory_ is a function that takes arguments for data and
                 * configuration and returns a directive. Users of directive usually refer to
                 * the directive factory as the directive. For example, "The repeat directive".
                 *
                 * Usually a template author will invoke a directive factory in their template
                 * with relevant arguments, which will then return a directive function.
                 *
                 * Here's an example of using the `repeat()` directive factory that takes an
                 * array and a function to render an item:
                 *
                 * ```js
                 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
                 * ```
                 *
                 * When `repeat` is invoked, it returns a directive function that closes over
                 * `items` and the template function. When the outer template is rendered, the
                 * return directive function is called with the Part for the expression.
                 * `repeat` then performs it's custom logic to render multiple items.
                 *
                 * @param f The directive factory function. Must be a function that returns a
                 * function of the signature `(part: Part) => void`. The returned function will
                 * be called with the part object.
                 *
                 * @example
                 *
                 * import {directive, html} from 'lit-html';
                 *
                 * const immutable = directive((v) => (part) => {
                 *   if (part.value !== v) {
                 *     part.setValue(v)
                 *   }
                 * });
                 */

                const directive = (f) => (...args) => {
                    const d = f(...args);
                    directives.set(d, true);
                    return d;
                };

                exports.directive = directive;

                const isDirective = (o) => {
                    return typeof o === "function" && directives.has(o);
                };

                exports.isDirective = isDirective;
            },
            {}
        ],
        "../../../node_modules/lit-html/lib/dom.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.removeNodes = exports.reparentNodes = exports.isCEPolyfill = void 0;

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * True if the custom elements polyfill is in use.
                 */
                const isCEPolyfill =
                    typeof window !== "undefined" &&
                    window.customElements != null &&
                    window.customElements.polyfillWrapFlushCallback !== undefined;
                /**
                 * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
                 * into another container (could be the same container), before `before`. If
                 * `before` is null, it appends the nodes to the container.
                 */

                exports.isCEPolyfill = isCEPolyfill;

                const reparentNodes = (container, start, end = null, before = null) => {
                    while (start !== end) {
                        const n = start.nextSibling;
                        container.insertBefore(start, before);
                        start = n;
                    }
                };
                /**
                 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
                 * `container`.
                 */

                exports.reparentNodes = reparentNodes;

                const removeNodes = (container, start, end = null) => {
                    while (start !== end) {
                        const n = start.nextSibling;
                        container.removeChild(start);
                        start = n;
                    }
                };

                exports.removeNodes = removeNodes;
            },
            {}
        ],
        "../../../node_modules/lit-html/lib/part.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.nothing = exports.noChange = void 0;

                /**
                 * @license
                 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * A sentinel value that signals that a value was handled by a directive and
                 * should not be written to the DOM.
                 */
                const noChange = {};
                /**
                 * A sentinel value that signals a NodePart to fully clear its content.
                 */

                exports.noChange = noChange;
                const nothing = {};
                exports.nothing = nothing;
            },
            {}
        ],
        "../../../node_modules/lit-html/lib/template.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.lastAttributeNameRegex = exports.createMarker = exports.isTemplatePartActive = exports.Template = exports.boundAttributeSuffix = exports.markerRegex = exports.nodeMarker = exports.marker = void 0;

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * An expression marker with embedded unique key to avoid collision with
                 * possible text in templates.
                 */
                const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
                /**
                 * An expression marker used text-positions, multi-binding attributes, and
                 * attributes with markup-like text values.
                 */

                exports.marker = marker;
                const nodeMarker = `<!--${marker}-->`;
                exports.nodeMarker = nodeMarker;
                const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
                /**
                 * Suffix appended to all bound attribute names.
                 */

                exports.markerRegex = markerRegex;
                const boundAttributeSuffix = "$lit$";
                /**
                 * An updatable Template that tracks the location of dynamic parts.
                 */

                exports.boundAttributeSuffix = boundAttributeSuffix;

                class Template {
                    constructor(result, element) {
                        this.parts = [];
                        this.element = element;
                        const nodesToRemove = [];
                        const stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

                        const walker = document.createTreeWalker(
                            element.content,
                            133,
                            /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
                            null,
                            false
                        ); // Keeps track of the last index associated with a part. We try to delete
                        // unnecessary nodes, but we never want to associate two different parts
                        // to the same index. They must have a constant node between.

                        let lastPartIndex = 0;
                        let index = -1;
                        let partIndex = 0;
                        const {
                            strings,
                            values: { length }
                        } = result;

                        while (partIndex < length) {
                            const node = walker.nextNode();

                            if (node === null) {
                                // We've exhausted the content inside a nested template element.
                                // Because we still have parts (the outer for-loop), we know:
                                // - There is a template in the stack
                                // - The walker will find a nextNode outside the template
                                walker.currentNode = stack.pop();
                                continue;
                            }

                            index++;

                            if (
                                node.nodeType === 1
                                /* Node.ELEMENT_NODE */
                            ) {
                                if (node.hasAttributes()) {
                                    const attributes = node.attributes;
                                    const { length } = attributes; // Per
                                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                                    // attributes are not guaranteed to be returned in document order.
                                    // In particular, Edge/IE can return them out of order, so we cannot
                                    // assume a correspondence between part index and attribute index.

                                    let count = 0;

                                    for (let i = 0; i < length; i++) {
                                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                                            count++;
                                        }
                                    }

                                    while (count-- > 0) {
                                        // Get the template literal section leading up to the first
                                        // expression in this attribute
                                        const stringForPart = strings[partIndex]; // Find the attribute name

                                        const name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
                                        // All bound attributes have had a suffix added in
                                        // TemplateResult#getHTML to opt out of special attribute
                                        // handling. To look up the attribute value we also need to add
                                        // the suffix.

                                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                                        const attributeValue = node.getAttribute(attributeLookupName);
                                        node.removeAttribute(attributeLookupName);
                                        const statics = attributeValue.split(markerRegex);
                                        this.parts.push({
                                            type: "attribute",
                                            index,
                                            name,
                                            strings: statics
                                        });
                                        partIndex += statics.length - 1;
                                    }
                                }

                                if (node.tagName === "TEMPLATE") {
                                    stack.push(node);
                                    walker.currentNode = node.content;
                                }
                            } else if (
                                node.nodeType === 3
                                /* Node.TEXT_NODE */
                            ) {
                                const data = node.data;

                                if (data.indexOf(marker) >= 0) {
                                    const parent = node.parentNode;
                                    const strings = data.split(markerRegex);
                                    const lastIndex = strings.length - 1; // Generate a new text node for each literal section
                                    // These nodes are also used as the markers for node parts

                                    for (let i = 0; i < lastIndex; i++) {
                                        let insert;
                                        let s = strings[i];

                                        if (s === "") {
                                            insert = createMarker();
                                        } else {
                                            const match = lastAttributeNameRegex.exec(s);

                                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                                s =
                                                    s.slice(0, match.index) +
                                                    match[1] +
                                                    match[2].slice(0, -boundAttributeSuffix.length) +
                                                    match[3];
                                            }

                                            insert = document.createTextNode(s);
                                        }

                                        parent.insertBefore(insert, node);
                                        this.parts.push({
                                            type: "node",
                                            index: ++index
                                        });
                                    } // If there's no text, we must insert a comment to mark our place.
                                    // Else, we can trust it will stick around after cloning.

                                    if (strings[lastIndex] === "") {
                                        parent.insertBefore(createMarker(), node);
                                        nodesToRemove.push(node);
                                    } else {
                                        node.data = strings[lastIndex];
                                    } // We have a part for each match found

                                    partIndex += lastIndex;
                                }
                            } else if (
                                node.nodeType === 8
                                /* Node.COMMENT_NODE */
                            ) {
                                if (node.data === marker) {
                                    const parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
                                    // the following are true:
                                    //  * We don't have a previousSibling
                                    //  * The previousSibling is already the start of a previous part

                                    if (node.previousSibling === null || index === lastPartIndex) {
                                        index++;
                                        parent.insertBefore(createMarker(), node);
                                    }

                                    lastPartIndex = index;
                                    this.parts.push({
                                        type: "node",
                                        index
                                    }); // If we don't have a nextSibling, keep this node so we have an end.
                                    // Else, we can remove it to save future costs.

                                    if (node.nextSibling === null) {
                                        node.data = "";
                                    } else {
                                        nodesToRemove.push(node);
                                        index--;
                                    }

                                    partIndex++;
                                } else {
                                    let i = -1;

                                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                                        // Comment node has a binding marker inside, make an inactive part
                                        // The binding won't work, but subsequent bindings will
                                        // TODO (justinfagnani): consider whether it's even worth it to
                                        // make bindings in comments work
                                        this.parts.push({
                                            type: "node",
                                            index: -1
                                        });
                                        partIndex++;
                                    }
                                }
                            }
                        } // Remove text binding nodes after the walk to not disturb the TreeWalker

                        for (const n of nodesToRemove) {
                            n.parentNode.removeChild(n);
                        }
                    }
                }

                exports.Template = Template;

                const endsWith = (str, suffix) => {
                    const index = str.length - suffix.length;
                    return index >= 0 && str.slice(index) === suffix;
                };

                const isTemplatePartActive = (part) => part.index !== -1; // Allows `document.createComment('')` to be renamed for a
                // small manual size-savings.

                exports.isTemplatePartActive = isTemplatePartActive;

                const createMarker = () => document.createComment("");
                /**
                 * This regex extracts the attribute name preceding an attribute-position
                 * expression. It does this by matching the syntax allowed for attributes
                 * against the string literal directly preceding the expression, assuming that
                 * the expression is in an attribute-value position.
                 *
                 * See attributes in the HTML spec:
                 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
                 *
                 * " \x09\x0a\x0c\x0d" are HTML space characters:
                 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
                 *
                 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
                 * space character except " ".
                 *
                 * So an attribute is:
                 *  * The name: any character except a control character, space character, ('),
                 *    ("), ">", "=", or "/"
                 *  * Followed by zero or more space characters
                 *  * Followed by "="
                 *  * Followed by zero or more space characters
                 *  * Followed by:
                 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
                 *    * (") then any non-("), or
                 *    * (') then any non-(')
                 */

                exports.createMarker = createMarker;
                const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/; // eslint-disable-next-line no-control-regex
                exports.lastAttributeNameRegex = lastAttributeNameRegex;
            },
            {}
        ],
        "../../../node_modules/lit-html/lib/template-instance.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.TemplateInstance = void 0;

                var _dom = require("./dom.js");

                var _template = require("./template.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * @module lit-html
                 */

                /**
                 * An instance of a `Template` that can be attached to the DOM and updated
                 * with new values.
                 */
                class TemplateInstance {
                    constructor(template, processor, options) {
                        this.__parts = [];
                        this.template = template;
                        this.processor = processor;
                        this.options = options;
                    }

                    update(values) {
                        let i = 0;

                        for (const part of this.__parts) {
                            if (part !== undefined) {
                                part.setValue(values[i]);
                            }

                            i++;
                        }

                        for (const part of this.__parts) {
                            if (part !== undefined) {
                                part.commit();
                            }
                        }
                    }

                    _clone() {
                        // There are a number of steps in the lifecycle of a template instance's
                        // DOM fragment:
                        //  1. Clone - create the instance fragment
                        //  2. Adopt - adopt into the main document
                        //  3. Process - find part markers and create parts
                        //  4. Upgrade - upgrade custom elements
                        //  5. Update - set node, attribute, property, etc., values
                        //  6. Connect - connect to the document. Optional and outside of this
                        //     method.
                        //
                        // We have a few constraints on the ordering of these steps:
                        //  * We need to upgrade before updating, so that property values will pass
                        //    through any property setters.
                        //  * We would like to process before upgrading so that we're sure that the
                        //    cloned fragment is inert and not disturbed by self-modifying DOM.
                        //  * We want custom elements to upgrade even in disconnected fragments.
                        //
                        // Given these constraints, with full custom elements support we would
                        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
                        //
                        // But Safari does not implement CustomElementRegistry#upgrade, so we
                        // can not implement that order and still have upgrade-before-update and
                        // upgrade disconnected fragments. So we instead sacrifice the
                        // process-before-upgrade constraint, since in Custom Elements v1 elements
                        // must not modify their light DOM in the constructor. We still have issues
                        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
                        // that don't strictly adhere to the no-modification rule because shadow
                        // DOM, which may be created in the constructor, is emulated by being placed
                        // in the light DOM.
                        //
                        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
                        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
                        // in one step.
                        //
                        // The Custom Elements v1 polyfill supports upgrade(), so the order when
                        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
                        // Connect.
                        const fragment = _dom.isCEPolyfill
                            ? this.template.element.content.cloneNode(true)
                            : document.importNode(this.template.element.content, true);
                        const stack = [];
                        const parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

                        const walker = document.createTreeWalker(
                            fragment,
                            133,
                            /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
                            null,
                            false
                        );
                        let partIndex = 0;
                        let nodeIndex = 0;
                        let part;
                        let node = walker.nextNode(); // Loop through all the nodes and parts of a template

                        while (partIndex < parts.length) {
                            part = parts[partIndex];

                            if (!(0, _template.isTemplatePartActive)(part)) {
                                this.__parts.push(undefined);

                                partIndex++;
                                continue;
                            } // Progress the tree walker until we find our next part's node.
                            // Note that multiple parts may share the same node (attribute parts
                            // on a single element), so this loop may not run at all.

                            while (nodeIndex < part.index) {
                                nodeIndex++;

                                if (node.nodeName === "TEMPLATE") {
                                    stack.push(node);
                                    walker.currentNode = node.content;
                                }

                                if ((node = walker.nextNode()) === null) {
                                    // We've exhausted the content inside a nested template element.
                                    // Because we still have parts (the outer for-loop), we know:
                                    // - There is a template in the stack
                                    // - The walker will find a nextNode outside the template
                                    walker.currentNode = stack.pop();
                                    node = walker.nextNode();
                                }
                            } // We've arrived at our part's node.

                            if (part.type === "node") {
                                const part = this.processor.handleTextExpression(this.options);
                                part.insertAfterNode(node.previousSibling);

                                this.__parts.push(part);
                            } else {
                                this.__parts.push(
                                    ...this.processor.handleAttributeExpressions(
                                        node,
                                        part.name,
                                        part.strings,
                                        this.options
                                    )
                                );
                            }

                            partIndex++;
                        }

                        if (_dom.isCEPolyfill) {
                            document.adoptNode(fragment);
                            customElements.upgrade(fragment);
                        }

                        return fragment;
                    }
                }

                exports.TemplateInstance = TemplateInstance;
            },
            {
                "./dom.js": "../../../node_modules/lit-html/lib/dom.js",
                "./template.js": "../../../node_modules/lit-html/lib/template.js"
            }
        ],
        "../../../node_modules/lit-html/lib/template-result.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.SVGTemplateResult = exports.TemplateResult = void 0;

                var _dom = require("./dom.js");

                var _template = require("./template.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * @module lit-html
                 */
                const commentMarker = ` ${_template.marker} `;
                /**
                 * The return type of `html`, which holds a Template and the values from
                 * interpolated expressions.
                 */

                class TemplateResult {
                    constructor(strings, values, type, processor) {
                        this.strings = strings;
                        this.values = values;
                        this.type = type;
                        this.processor = processor;
                    }
                    /**
                     * Returns a string of HTML used to create a `<template>` element.
                     */

                    getHTML() {
                        const l = this.strings.length - 1;
                        let html = "";
                        let isCommentBinding = false;

                        for (let i = 0; i < l; i++) {
                            const s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
                            // into the template source before it's parsed by the browser's HTML
                            // parser. The marker type is based on whether the expression is in an
                            // attribute, text, or comment position.
                            //   * For node-position bindings we insert a comment with the marker
                            //     sentinel as its text content, like <!--{{lit-guid}}-->.
                            //   * For attribute bindings we insert just the marker sentinel for the
                            //     first binding, so that we support unquoted attribute bindings.
                            //     Subsequent bindings can use a comment marker because multi-binding
                            //     attributes must be quoted.
                            //   * For comment bindings we insert just the marker sentinel so we don't
                            //     close the comment.
                            //
                            // The following code scans the template source, but is *not* an HTML
                            // parser. We don't need to track the tree structure of the HTML, only
                            // whether a binding is inside a comment, and if not, if it appears to be
                            // the first binding in an attribute.

                            const commentOpen = s.lastIndexOf("<!--"); // We're in comment position if we have a comment open with no following
                            // comment close. Because <-- can appear in an attribute value there can
                            // be false positives.

                            isCommentBinding =
                                (commentOpen > -1 || isCommentBinding) && s.indexOf("-->", commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceding the
                            // expression. This can match "name=value" like structures in text,
                            // comments, and attribute values, so there can be false-positives.

                            const attributeMatch = _template.lastAttributeNameRegex.exec(s);

                            if (attributeMatch === null) {
                                // We're only in this branch if we don't have a attribute-like
                                // preceding sequence. For comments, this guards against unusual
                                // attribute values like <div foo="<!--${'bar'}">. Cases like
                                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                                // below.
                                html += s + (isCommentBinding ? commentMarker : _template.nodeMarker);
                            } else {
                                // For attributes we use just a marker sentinel, and also append a
                                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                                // that IE and Edge do for style and certain SVG attributes.
                                html +=
                                    s.substr(0, attributeMatch.index) +
                                    attributeMatch[1] +
                                    attributeMatch[2] +
                                    _template.boundAttributeSuffix +
                                    attributeMatch[3] +
                                    _template.marker;
                            }
                        }

                        html += this.strings[l];
                        return html;
                    }

                    getTemplateElement() {
                        const template = document.createElement("template");
                        template.innerHTML = this.getHTML();
                        return template;
                    }
                }
                /**
                 * A TemplateResult for SVG fragments.
                 *
                 * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
                 * SVG namespace, then modifies the template to remove the `<svg>` tag so that
                 * clones only container the original fragment.
                 */

                exports.TemplateResult = TemplateResult;

                class SVGTemplateResult extends TemplateResult {
                    getHTML() {
                        return `<svg>${super.getHTML()}</svg>`;
                    }

                    getTemplateElement() {
                        const template = super.getTemplateElement();
                        const content = template.content;
                        const svgElement = content.firstChild;
                        content.removeChild(svgElement);
                        (0, _dom.reparentNodes)(content, svgElement.firstChild);
                        return template;
                    }
                }

                exports.SVGTemplateResult = SVGTemplateResult;
            },
            {
                "./dom.js": "../../../node_modules/lit-html/lib/dom.js",
                "./template.js": "../../../node_modules/lit-html/lib/template.js"
            }
        ],
        "../../../node_modules/lit-html/lib/parts.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.EventPart = exports.PropertyPart = exports.PropertyCommitter = exports.BooleanAttributePart = exports.NodePart = exports.AttributePart = exports.AttributeCommitter = exports.isIterable = exports.isPrimitive = void 0;

                var _directive = require("./directive.js");

                var _dom = require("./dom.js");

                var _part = require("./part.js");

                var _templateInstance = require("./template-instance.js");

                var _templateResult = require("./template-result.js");

                var _template = require("./template.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * @module lit-html
                 */
                const isPrimitive = (value) => {
                    return value === null || !(typeof value === "object" || typeof value === "function");
                };

                exports.isPrimitive = isPrimitive;

                const isIterable = (value) => {
                    return (
                        Array.isArray(value) || !!(value && value[Symbol.iterator]) // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    );
                };
                /**
                 * Writes attribute values to the DOM for a group of AttributeParts bound to a
                 * single attribute. The value is only set once even if there are multiple parts
                 * for an attribute.
                 */

                exports.isIterable = isIterable;

                class AttributeCommitter {
                    constructor(element, name, strings) {
                        this.dirty = true;
                        this.element = element;
                        this.name = name;
                        this.strings = strings;
                        this.parts = [];

                        for (let i = 0; i < strings.length - 1; i++) {
                            this.parts[i] = this._createPart();
                        }
                    }
                    /**
                     * Creates a single part. Override this to create a differnt type of part.
                     */

                    _createPart() {
                        return new AttributePart(this);
                    }

                    _getValue() {
                        const strings = this.strings;
                        const l = strings.length - 1;
                        let text = "";

                        for (let i = 0; i < l; i++) {
                            text += strings[i];
                            const part = this.parts[i];

                            if (part !== undefined) {
                                const v = part.value;

                                if (isPrimitive(v) || !isIterable(v)) {
                                    text += typeof v === "string" ? v : String(v);
                                } else {
                                    for (const t of v) {
                                        text += typeof t === "string" ? t : String(t);
                                    }
                                }
                            }
                        }

                        text += strings[l];
                        return text;
                    }

                    commit() {
                        if (this.dirty) {
                            this.dirty = false;
                            this.element.setAttribute(this.name, this._getValue());
                        }
                    }
                }
                /**
                 * A Part that controls all or part of an attribute value.
                 */

                exports.AttributeCommitter = AttributeCommitter;

                class AttributePart {
                    constructor(committer) {
                        this.value = undefined;
                        this.committer = committer;
                    }

                    setValue(value) {
                        if (value !== _part.noChange && (!isPrimitive(value) || value !== this.value)) {
                            this.value = value; // If the value is a not a directive, dirty the committer so that it'll
                            // call setAttribute. If the value is a directive, it'll dirty the
                            // committer if it calls setValue().

                            if (!(0, _directive.isDirective)(value)) {
                                this.committer.dirty = true;
                            }
                        }
                    }

                    commit() {
                        while ((0, _directive.isDirective)(this.value)) {
                            const directive = this.value;
                            this.value = _part.noChange;
                            directive(this);
                        }

                        if (this.value === _part.noChange) {
                            return;
                        }

                        this.committer.commit();
                    }
                }
                /**
                 * A Part that controls a location within a Node tree. Like a Range, NodePart
                 * has start and end locations and can set and update the Nodes between those
                 * locations.
                 *
                 * NodeParts support several value types: primitives, Nodes, TemplateResults,
                 * as well as arrays and iterables of those types.
                 */

                exports.AttributePart = AttributePart;

                class NodePart {
                    constructor(options) {
                        this.value = undefined;
                        this.__pendingValue = undefined;
                        this.options = options;
                    }
                    /**
                     * Appends this part into a container.
                     *
                     * This part must be empty, as its contents are not automatically moved.
                     */

                    appendInto(container) {
                        this.startNode = container.appendChild((0, _template.createMarker)());
                        this.endNode = container.appendChild((0, _template.createMarker)());
                    }
                    /**
                     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
                     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
                     * such as those that appear in a literal section of a template.
                     *
                     * This part must be empty, as its contents are not automatically moved.
                     */

                    insertAfterNode(ref) {
                        this.startNode = ref;
                        this.endNode = ref.nextSibling;
                    }
                    /**
                     * Appends this part into a parent part.
                     *
                     * This part must be empty, as its contents are not automatically moved.
                     */

                    appendIntoPart(part) {
                        part.__insert((this.startNode = (0, _template.createMarker)()));

                        part.__insert((this.endNode = (0, _template.createMarker)()));
                    }
                    /**
                     * Inserts this part after the `ref` part.
                     *
                     * This part must be empty, as its contents are not automatically moved.
                     */

                    insertAfterPart(ref) {
                        ref.__insert((this.startNode = (0, _template.createMarker)()));

                        this.endNode = ref.endNode;
                        ref.endNode = this.startNode;
                    }

                    setValue(value) {
                        this.__pendingValue = value;
                    }

                    commit() {
                        if (this.startNode.parentNode === null) {
                            return;
                        }

                        while ((0, _directive.isDirective)(this.__pendingValue)) {
                            const directive = this.__pendingValue;
                            this.__pendingValue = _part.noChange;
                            directive(this);
                        }

                        const value = this.__pendingValue;

                        if (value === _part.noChange) {
                            return;
                        }

                        if (isPrimitive(value)) {
                            if (value !== this.value) {
                                this.__commitText(value);
                            }
                        } else if (value instanceof _templateResult.TemplateResult) {
                            this.__commitTemplateResult(value);
                        } else if (value instanceof Node) {
                            this.__commitNode(value);
                        } else if (isIterable(value)) {
                            this.__commitIterable(value);
                        } else if (value === _part.nothing) {
                            this.value = _part.nothing;
                            this.clear();
                        } else {
                            // Fallback, will render the string representation
                            this.__commitText(value);
                        }
                    }

                    __insert(node) {
                        this.endNode.parentNode.insertBefore(node, this.endNode);
                    }

                    __commitNode(value) {
                        if (this.value === value) {
                            return;
                        }

                        this.clear();

                        this.__insert(value);

                        this.value = value;
                    }

                    __commitText(value) {
                        const node = this.startNode.nextSibling;
                        value = value == null ? "" : value; // If `value` isn't already a string, we explicitly convert it here in case
                        // it can't be implicitly converted - i.e. it's a symbol.

                        const valueAsString = typeof value === "string" ? value : String(value);

                        if (
                            node === this.endNode.previousSibling &&
                            node.nodeType === 3
                            /* Node.TEXT_NODE */
                        ) {
                            // If we only have a single text node between the markers, we can just
                            // set its value, rather than replacing it.
                            // TODO(justinfagnani): Can we just check if this.value is primitive?
                            node.data = valueAsString;
                        } else {
                            this.__commitNode(document.createTextNode(valueAsString));
                        }

                        this.value = value;
                    }

                    __commitTemplateResult(value) {
                        const template = this.options.templateFactory(value);

                        if (
                            this.value instanceof _templateInstance.TemplateInstance &&
                            this.value.template === template
                        ) {
                            this.value.update(value.values);
                        } else {
                            // Make sure we propagate the template processor from the TemplateResult
                            // so that we use its syntax extension, etc. The template factory comes
                            // from the render function options so that it can control template
                            // caching and preprocessing.
                            const instance = new _templateInstance.TemplateInstance(
                                template,
                                value.processor,
                                this.options
                            );

                            const fragment = instance._clone();

                            instance.update(value.values);

                            this.__commitNode(fragment);

                            this.value = instance;
                        }
                    }

                    __commitIterable(value) {
                        // For an Iterable, we create a new InstancePart per item, then set its
                        // value to the item. This is a little bit of overhead for every item in
                        // an Iterable, but it lets us recurse easily and efficiently update Arrays
                        // of TemplateResults that will be commonly returned from expressions like:
                        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
                        // If _value is an array, then the previous render was of an
                        // iterable and _value will contain the NodeParts from the previous
                        // render. If _value is not an array, clear this part and make a new
                        // array for NodeParts.
                        if (!Array.isArray(this.value)) {
                            this.value = [];
                            this.clear();
                        } // Lets us keep track of how many items we stamped so we can clear leftover
                        // items from a previous render

                        const itemParts = this.value;
                        let partIndex = 0;
                        let itemPart;

                        for (const item of value) {
                            // Try to reuse an existing part
                            itemPart = itemParts[partIndex]; // If no existing part, create a new one

                            if (itemPart === undefined) {
                                itemPart = new NodePart(this.options);
                                itemParts.push(itemPart);

                                if (partIndex === 0) {
                                    itemPart.appendIntoPart(this);
                                } else {
                                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                                }
                            }

                            itemPart.setValue(item);
                            itemPart.commit();
                            partIndex++;
                        }

                        if (partIndex < itemParts.length) {
                            // Truncate the parts array so _value reflects the current state
                            itemParts.length = partIndex;
                            this.clear(itemPart && itemPart.endNode);
                        }
                    }

                    clear(startNode = this.startNode) {
                        (0, _dom.removeNodes)(this.startNode.parentNode, startNode.nextSibling, this.endNode);
                    }
                }
                /**
                 * Implements a boolean attribute, roughly as defined in the HTML
                 * specification.
                 *
                 * If the value is truthy, then the attribute is present with a value of
                 * ''. If the value is falsey, the attribute is removed.
                 */

                exports.NodePart = NodePart;

                class BooleanAttributePart {
                    constructor(element, name, strings) {
                        this.value = undefined;
                        this.__pendingValue = undefined;

                        if (strings.length !== 2 || strings[0] !== "" || strings[1] !== "") {
                            throw new Error("Boolean attributes can only contain a single expression");
                        }

                        this.element = element;
                        this.name = name;
                        this.strings = strings;
                    }

                    setValue(value) {
                        this.__pendingValue = value;
                    }

                    commit() {
                        while ((0, _directive.isDirective)(this.__pendingValue)) {
                            const directive = this.__pendingValue;
                            this.__pendingValue = _part.noChange;
                            directive(this);
                        }

                        if (this.__pendingValue === _part.noChange) {
                            return;
                        }

                        const value = !!this.__pendingValue;

                        if (this.value !== value) {
                            if (value) {
                                this.element.setAttribute(this.name, "");
                            } else {
                                this.element.removeAttribute(this.name);
                            }

                            this.value = value;
                        }

                        this.__pendingValue = _part.noChange;
                    }
                }
                /**
                 * Sets attribute values for PropertyParts, so that the value is only set once
                 * even if there are multiple parts for a property.
                 *
                 * If an expression controls the whole property value, then the value is simply
                 * assigned to the property under control. If there are string literals or
                 * multiple expressions, then the strings are expressions are interpolated into
                 * a string first.
                 */

                exports.BooleanAttributePart = BooleanAttributePart;

                class PropertyCommitter extends AttributeCommitter {
                    constructor(element, name, strings) {
                        super(element, name, strings);
                        this.single = strings.length === 2 && strings[0] === "" && strings[1] === "";
                    }

                    _createPart() {
                        return new PropertyPart(this);
                    }

                    _getValue() {
                        if (this.single) {
                            return this.parts[0].value;
                        }

                        return super._getValue();
                    }

                    commit() {
                        if (this.dirty) {
                            this.dirty = false; // eslint-disable-next-line @typescript-eslint/no-explicit-any

                            this.element[this.name] = this._getValue();
                        }
                    }
                }

                exports.PropertyCommitter = PropertyCommitter;

                class PropertyPart extends AttributePart {} // Detect event listener options support. If the `capture` property is read
                // from the options object, then options are supported. If not, then the third
                // argument to add/removeEventListener is interpreted as the boolean capture
                // value so we should only pass the `capture` property.

                exports.PropertyPart = PropertyPart;
                let eventOptionsSupported = false; // Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
                // blocks right into the body of a module

                (() => {
                    try {
                        const options = {
                            get capture() {
                                eventOptionsSupported = true;
                                return false;
                            }
                        }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

                        window.addEventListener("test", options, options); // eslint-disable-next-line @typescript-eslint/no-explicit-any

                        window.removeEventListener("test", options, options);
                    } catch (_e) {
                        // event options not supported
                    }
                })();

                class EventPart {
                    constructor(element, eventName, eventContext) {
                        this.value = undefined;
                        this.__pendingValue = undefined;
                        this.element = element;
                        this.eventName = eventName;
                        this.eventContext = eventContext;

                        this.__boundHandleEvent = (e) => this.handleEvent(e);
                    }

                    setValue(value) {
                        this.__pendingValue = value;
                    }

                    commit() {
                        while ((0, _directive.isDirective)(this.__pendingValue)) {
                            const directive = this.__pendingValue;
                            this.__pendingValue = _part.noChange;
                            directive(this);
                        }

                        if (this.__pendingValue === _part.noChange) {
                            return;
                        }

                        const newListener = this.__pendingValue;
                        const oldListener = this.value;
                        const shouldRemoveListener =
                            newListener == null ||
                            (oldListener != null &&
                                (newListener.capture !== oldListener.capture ||
                                    newListener.once !== oldListener.once ||
                                    newListener.passive !== oldListener.passive));
                        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

                        if (shouldRemoveListener) {
                            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
                        }

                        if (shouldAddListener) {
                            this.__options = getOptions(newListener);
                            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
                        }

                        this.value = newListener;
                        this.__pendingValue = _part.noChange;
                    }

                    handleEvent(event) {
                        if (typeof this.value === "function") {
                            this.value.call(this.eventContext || this.element, event);
                        } else {
                            this.value.handleEvent(event);
                        }
                    }
                } // We copy options because of the inconsistent behavior of browsers when reading
                // the third argument of add/removeEventListener. IE11 doesn't support options
                // at all. Chrome 41 only reads `capture` if the argument is an object.

                exports.EventPart = EventPart;

                const getOptions = (o) =>
                    o &&
                    (eventOptionsSupported
                        ? {
                              capture: o.capture,
                              passive: o.passive,
                              once: o.once
                          }
                        : o.capture);
            },
            {
                "./directive.js": "../../../node_modules/lit-html/lib/directive.js",
                "./dom.js": "../../../node_modules/lit-html/lib/dom.js",
                "./part.js": "../../../node_modules/lit-html/lib/part.js",
                "./template-instance.js": "../../../node_modules/lit-html/lib/template-instance.js",
                "./template-result.js": "../../../node_modules/lit-html/lib/template-result.js",
                "./template.js": "../../../node_modules/lit-html/lib/template.js"
            }
        ],
        "../../../node_modules/lit-html/lib/default-template-processor.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.defaultTemplateProcessor = exports.DefaultTemplateProcessor = void 0;

                var _parts = require("./parts.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * Creates Parts when a template is instantiated.
                 */
                class DefaultTemplateProcessor {
                    /**
                     * Create parts for an attribute-position binding, given the event, attribute
                     * name, and string literals.
                     *
                     * @param element The element containing the binding
                     * @param name  The attribute name
                     * @param strings The string literals. There are always at least two strings,
                     *   event for fully-controlled bindings with a single expression.
                     */
                    handleAttributeExpressions(element, name, strings, options) {
                        const prefix = name[0];

                        if (prefix === ".") {
                            const committer = new _parts.PropertyCommitter(element, name.slice(1), strings);
                            return committer.parts;
                        }

                        if (prefix === "@") {
                            return [new _parts.EventPart(element, name.slice(1), options.eventContext)];
                        }

                        if (prefix === "?") {
                            return [new _parts.BooleanAttributePart(element, name.slice(1), strings)];
                        }

                        const committer = new _parts.AttributeCommitter(element, name, strings);
                        return committer.parts;
                    }
                    /**
                     * Create parts for a text-position binding.
                     * @param templateFactory
                     */

                    handleTextExpression(options) {
                        return new _parts.NodePart(options);
                    }
                }

                exports.DefaultTemplateProcessor = DefaultTemplateProcessor;
                const defaultTemplateProcessor = new DefaultTemplateProcessor();
                exports.defaultTemplateProcessor = defaultTemplateProcessor;
            },
            { "./parts.js": "../../../node_modules/lit-html/lib/parts.js" }
        ],
        "../../../node_modules/lit-html/lib/template-factory.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.templateFactory = templateFactory;
                exports.templateCaches = void 0;

                var _template = require("./template.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * The default TemplateFactory which caches Templates keyed on
                 * result.type and result.strings.
                 */
                function templateFactory(result) {
                    let templateCache = templateCaches.get(result.type);

                    if (templateCache === undefined) {
                        templateCache = {
                            stringsArray: new WeakMap(),
                            keyString: new Map()
                        };
                        templateCaches.set(result.type, templateCache);
                    }

                    let template = templateCache.stringsArray.get(result.strings);

                    if (template !== undefined) {
                        return template;
                    } // If the TemplateStringsArray is new, generate a key from the strings
                    // This key is shared between all templates with identical content

                    const key = result.strings.join(_template.marker); // Check if we already have a Template for this key

                    template = templateCache.keyString.get(key);

                    if (template === undefined) {
                        // If we have not seen this key before, create a new Template
                        template = new _template.Template(result, result.getTemplateElement()); // Cache the Template for this key

                        templateCache.keyString.set(key, template);
                    } // Cache all future queries for this TemplateStringsArray

                    templateCache.stringsArray.set(result.strings, template);
                    return template;
                }

                const templateCaches = new Map();
                exports.templateCaches = templateCaches;
            },
            { "./template.js": "../../../node_modules/lit-html/lib/template.js" }
        ],
        "../../../node_modules/lit-html/lib/render.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.render = exports.parts = void 0;

                var _dom = require("./dom.js");

                var _parts = require("./parts.js");

                var _templateFactory = require("./template-factory.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 * @module lit-html
                 */
                const parts = new WeakMap();
                /**
                 * Renders a template result or other value to a container.
                 *
                 * To update a container with new values, reevaluate the template literal and
                 * call `render` with the new result.
                 *
                 * @param result Any value renderable by NodePart - typically a TemplateResult
                 *     created by evaluating a template tag like `html` or `svg`.
                 * @param container A DOM parent to render to. The entire contents are either
                 *     replaced, or efficiently updated if the same result type was previous
                 *     rendered there.
                 * @param options RenderOptions for the entire render tree rendered to this
                 *     container. Render options must *not* change between renders to the same
                 *     container, as those changes will not effect previously rendered DOM.
                 */

                exports.parts = parts;

                const render = (result, container, options) => {
                    let part = parts.get(container);

                    if (part === undefined) {
                        (0, _dom.removeNodes)(container, container.firstChild);
                        parts.set(
                            container,
                            (part = new _parts.NodePart(
                                Object.assign(
                                    {
                                        templateFactory: _templateFactory.templateFactory
                                    },
                                    options
                                )
                            ))
                        );
                        part.appendInto(container);
                    }

                    part.setValue(result);
                    part.commit();
                };

                exports.render = render;
            },
            {
                "./dom.js": "../../../node_modules/lit-html/lib/dom.js",
                "./parts.js": "../../../node_modules/lit-html/lib/parts.js",
                "./template-factory.js": "../../../node_modules/lit-html/lib/template-factory.js"
            }
        ],
        "../../../node_modules/lit-html/lit-html.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                Object.defineProperty(exports, "DefaultTemplateProcessor", {
                    enumerable: true,
                    get: function () {
                        return _defaultTemplateProcessor.DefaultTemplateProcessor;
                    }
                });
                Object.defineProperty(exports, "defaultTemplateProcessor", {
                    enumerable: true,
                    get: function () {
                        return _defaultTemplateProcessor.defaultTemplateProcessor;
                    }
                });
                Object.defineProperty(exports, "SVGTemplateResult", {
                    enumerable: true,
                    get: function () {
                        return _templateResult.SVGTemplateResult;
                    }
                });
                Object.defineProperty(exports, "TemplateResult", {
                    enumerable: true,
                    get: function () {
                        return _templateResult.TemplateResult;
                    }
                });
                Object.defineProperty(exports, "directive", {
                    enumerable: true,
                    get: function () {
                        return _directive.directive;
                    }
                });
                Object.defineProperty(exports, "isDirective", {
                    enumerable: true,
                    get: function () {
                        return _directive.isDirective;
                    }
                });
                Object.defineProperty(exports, "removeNodes", {
                    enumerable: true,
                    get: function () {
                        return _dom.removeNodes;
                    }
                });
                Object.defineProperty(exports, "reparentNodes", {
                    enumerable: true,
                    get: function () {
                        return _dom.reparentNodes;
                    }
                });
                Object.defineProperty(exports, "noChange", {
                    enumerable: true,
                    get: function () {
                        return _part.noChange;
                    }
                });
                Object.defineProperty(exports, "nothing", {
                    enumerable: true,
                    get: function () {
                        return _part.nothing;
                    }
                });
                Object.defineProperty(exports, "AttributeCommitter", {
                    enumerable: true,
                    get: function () {
                        return _parts.AttributeCommitter;
                    }
                });
                Object.defineProperty(exports, "AttributePart", {
                    enumerable: true,
                    get: function () {
                        return _parts.AttributePart;
                    }
                });
                Object.defineProperty(exports, "BooleanAttributePart", {
                    enumerable: true,
                    get: function () {
                        return _parts.BooleanAttributePart;
                    }
                });
                Object.defineProperty(exports, "EventPart", {
                    enumerable: true,
                    get: function () {
                        return _parts.EventPart;
                    }
                });
                Object.defineProperty(exports, "isIterable", {
                    enumerable: true,
                    get: function () {
                        return _parts.isIterable;
                    }
                });
                Object.defineProperty(exports, "isPrimitive", {
                    enumerable: true,
                    get: function () {
                        return _parts.isPrimitive;
                    }
                });
                Object.defineProperty(exports, "NodePart", {
                    enumerable: true,
                    get: function () {
                        return _parts.NodePart;
                    }
                });
                Object.defineProperty(exports, "PropertyCommitter", {
                    enumerable: true,
                    get: function () {
                        return _parts.PropertyCommitter;
                    }
                });
                Object.defineProperty(exports, "PropertyPart", {
                    enumerable: true,
                    get: function () {
                        return _parts.PropertyPart;
                    }
                });
                Object.defineProperty(exports, "parts", {
                    enumerable: true,
                    get: function () {
                        return _render.parts;
                    }
                });
                Object.defineProperty(exports, "render", {
                    enumerable: true,
                    get: function () {
                        return _render.render;
                    }
                });
                Object.defineProperty(exports, "templateCaches", {
                    enumerable: true,
                    get: function () {
                        return _templateFactory.templateCaches;
                    }
                });
                Object.defineProperty(exports, "templateFactory", {
                    enumerable: true,
                    get: function () {
                        return _templateFactory.templateFactory;
                    }
                });
                Object.defineProperty(exports, "TemplateInstance", {
                    enumerable: true,
                    get: function () {
                        return _templateInstance.TemplateInstance;
                    }
                });
                Object.defineProperty(exports, "createMarker", {
                    enumerable: true,
                    get: function () {
                        return _template.createMarker;
                    }
                });
                Object.defineProperty(exports, "isTemplatePartActive", {
                    enumerable: true,
                    get: function () {
                        return _template.isTemplatePartActive;
                    }
                });
                Object.defineProperty(exports, "Template", {
                    enumerable: true,
                    get: function () {
                        return _template.Template;
                    }
                });
                exports.svg = exports.html = void 0;

                var _defaultTemplateProcessor = require("./lib/default-template-processor.js");

                var _templateResult = require("./lib/template-result.js");

                var _directive = require("./lib/directive.js");

                var _dom = require("./lib/dom.js");

                var _part = require("./lib/part.js");

                var _parts = require("./lib/parts.js");

                var _render = require("./lib/render.js");

                var _templateFactory = require("./lib/template-factory.js");

                var _templateInstance = require("./lib/template-instance.js");

                var _template = require("./lib/template.js");

                /**
                 * @license
                 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                 * This code may only be used under the BSD style license found at
                 * http://polymer.github.io/LICENSE.txt
                 * The complete set of authors may be found at
                 * http://polymer.github.io/AUTHORS.txt
                 * The complete set of contributors may be found at
                 * http://polymer.github.io/CONTRIBUTORS.txt
                 * Code distributed by Google as part of the polymer project is also
                 * subject to an additional IP rights grant found at
                 * http://polymer.github.io/PATENTS.txt
                 */

                /**
                 *
                 * Main lit-html module.
                 *
                 * Main exports:
                 *
                 * -  [[html]]
                 * -  [[svg]]
                 * -  [[render]]
                 *
                 * @module lit-html
                 * @preferred
                 */

                /**
                 * Do not remove this comment; it keeps typedoc from misplacing the module
                 * docs.
                 */
                // TODO(justinfagnani): remove line when we get NodePart moving methods
                // IMPORTANT: do not change the property name or the assignment expression.
                // This line will be used in regexes to search for lit-html usage.
                // TODO(justinfagnani): inject version number at build time
                if (typeof window !== "undefined") {
                    (window["litHtmlVersions"] || (window["litHtmlVersions"] = [])).push("1.2.1");
                }
                /**
                 * Interprets a template literal as an HTML template that can efficiently
                 * render to and update a container.
                 */

                const html = (strings, ...values) =>
                    new _templateResult.TemplateResult(
                        strings,
                        values,
                        "html",
                        _defaultTemplateProcessor.defaultTemplateProcessor
                    );
                /**
                 * Interprets a template literal as an SVG template that can efficiently
                 * render to and update a container.
                 */

                exports.html = html;

                const svg = (strings, ...values) =>
                    new _templateResult.SVGTemplateResult(
                        strings,
                        values,
                        "svg",
                        _defaultTemplateProcessor.defaultTemplateProcessor
                    );

                exports.svg = svg;
            },
            {
                "./lib/default-template-processor.js":
                    "../../../node_modules/lit-html/lib/default-template-processor.js",
                "./lib/template-result.js": "../../../node_modules/lit-html/lib/template-result.js",
                "./lib/directive.js": "../../../node_modules/lit-html/lib/directive.js",
                "./lib/dom.js": "../../../node_modules/lit-html/lib/dom.js",
                "./lib/part.js": "../../../node_modules/lit-html/lib/part.js",
                "./lib/parts.js": "../../../node_modules/lit-html/lib/parts.js",
                "./lib/render.js": "../../../node_modules/lit-html/lib/render.js",
                "./lib/template-factory.js": "../../../node_modules/lit-html/lib/template-factory.js",
                "./lib/template-instance.js": "../../../node_modules/lit-html/lib/template-instance.js",
                "./lib/template.js": "../../../node_modules/lit-html/lib/template.js"
            }
        ],
        "../../../node_modules/eventmit/dist/eventmit.module.js": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.eventmit = void 0;

                var n = function () {
                    var n = new Set();
                    return {
                        on: function (t) {
                            n.add(t);
                        },
                        off: function (t) {
                            n.delete(t);
                        },
                        offAll: function () {
                            n.clear();
                        },
                        emit: function (t) {
                            n.forEach(function (n) {
                                return n(t);
                            });
                        }
                    };
                };

                exports.eventmit = n;
            },
            {}
        ],
        "../src/textchecker-store.ts": [
            function (require, module, exports) {
                "use strict";

                function _toConsumableArray(arr) {
                    return (
                        _arrayWithoutHoles(arr) ||
                        _iterableToArray(arr) ||
                        _unsupportedIterableToArray(arr) ||
                        _nonIterableSpread()
                    );
                }

                function _nonIterableSpread() {
                    throw new TypeError(
                        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                    );
                }

                function _unsupportedIterableToArray(o, minLen) {
                    if (!o) return;
                    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
                    var n = Object.prototype.toString.call(o).slice(8, -1);
                    if (n === "Object" && o.constructor) n = o.constructor.name;
                    if (n === "Map" || n === "Set") return Array.from(o);
                    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                        return _arrayLikeToArray(o, minLen);
                }

                function _iterableToArray(iter) {
                    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
                }

                function _arrayWithoutHoles(arr) {
                    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
                }

                function _arrayLikeToArray(arr, len) {
                    if (len == null || len > arr.length) len = arr.length;
                    for (var i = 0, arr2 = new Array(len); i < len; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                }

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.createTextCheckerStore = void 0;

                var eventmit_1 = require("eventmit");

                exports.createTextCheckerStore = function (initialState) {
                    var textCheckerState = Object.assign(
                        {
                            rectItems: [],
                            annotationItems: [],
                            highlightRectIdSet: new Set()
                        },
                        initialState
                    );
                    var changeEvent = eventmit_1.eventmit();
                    return {
                        get: function get() {
                            return textCheckerState;
                        },
                        onChange: function onChange(handler) {
                            changeEvent.on(handler);
                        },
                        dispose: function dispose() {
                            changeEvent.offAll();
                        },
                        highlightRectIndexes: function highlightRectIndexes(indexes) {
                            textCheckerState = Object.assign(Object.assign({}, textCheckerState), {
                                highlightRectIdSet: new Set(
                                    [].concat(
                                        _toConsumableArray(textCheckerState.highlightRectIdSet),
                                        _toConsumableArray(indexes)
                                    )
                                )
                            });
                            changeEvent.emit();
                        },
                        update: function update(state) {
                            textCheckerState = Object.assign(Object.assign({}, textCheckerState), state);
                            changeEvent.emit();
                        }
                    };
                };
            },
            { eventmit: "../../../node_modules/eventmit/dist/eventmit.module.js" }
        ],
        "../src/textchecker-element.ts": [
            function (require, module, exports) {
                "use strict";

                function _typeof(obj) {
                    "@babel/helpers - typeof";
                    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                        _typeof = function _typeof(obj) {
                            return typeof obj;
                        };
                    } else {
                        _typeof = function _typeof(obj) {
                            return obj &&
                                typeof Symbol === "function" &&
                                obj.constructor === Symbol &&
                                obj !== Symbol.prototype
                                ? "symbol"
                                : typeof obj;
                        };
                    }
                    return _typeof(obj);
                }

                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }

                function _defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                function _createClass(Constructor, protoProps, staticProps) {
                    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) _defineProperties(Constructor, staticProps);
                    return Constructor;
                }

                function _inherits(subClass, superClass) {
                    if (typeof superClass !== "function" && superClass !== null) {
                        throw new TypeError("Super expression must either be null or a function");
                    }
                    subClass.prototype = Object.create(superClass && superClass.prototype, {
                        constructor: { value: subClass, writable: true, configurable: true }
                    });
                    if (superClass) _setPrototypeOf(subClass, superClass);
                }

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = _getPrototypeOf(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = _getPrototypeOf(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return _possibleConstructorReturn(this, result);
                    };
                }

                function _possibleConstructorReturn(self, call) {
                    if (call && (_typeof(call) === "object" || typeof call === "function")) {
                        return call;
                    }
                    return _assertThisInitialized(self);
                }

                function _assertThisInitialized(self) {
                    if (self === void 0) {
                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    }
                    return self;
                }

                function _wrapNativeSuper(Class) {
                    var _cache = typeof Map === "function" ? new Map() : undefined;
                    _wrapNativeSuper = function _wrapNativeSuper(Class) {
                        if (Class === null || !_isNativeFunction(Class)) return Class;
                        if (typeof Class !== "function") {
                            throw new TypeError("Super expression must either be null or a function");
                        }
                        if (typeof _cache !== "undefined") {
                            if (_cache.has(Class)) return _cache.get(Class);
                            _cache.set(Class, Wrapper);
                        }
                        function Wrapper() {
                            return _construct(Class, arguments, _getPrototypeOf(this).constructor);
                        }
                        Wrapper.prototype = Object.create(Class.prototype, {
                            constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true }
                        });
                        return _setPrototypeOf(Wrapper, Class);
                    };
                    return _wrapNativeSuper(Class);
                }

                function _construct(Parent, args, Class) {
                    if (_isNativeReflectConstruct()) {
                        _construct = Reflect.construct;
                    } else {
                        _construct = function _construct(Parent, args, Class) {
                            var a = [null];
                            a.push.apply(a, args);
                            var Constructor = Function.bind.apply(Parent, a);
                            var instance = new Constructor();
                            if (Class) _setPrototypeOf(instance, Class.prototype);
                            return instance;
                        };
                    }
                    return _construct.apply(null, arguments);
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === "function") return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                function _isNativeFunction(fn) {
                    return Function.toString.call(fn).indexOf("[native code]") !== -1;
                }

                function _setPrototypeOf(o, p) {
                    _setPrototypeOf =
                        Object.setPrototypeOf ||
                        function _setPrototypeOf(o, p) {
                            o.__proto__ = p;
                            return o;
                        };
                    return _setPrototypeOf(o, p);
                }

                function _getPrototypeOf(o) {
                    _getPrototypeOf = Object.setPrototypeOf
                        ? Object.getPrototypeOf
                        : function _getPrototypeOf(o) {
                              return o.__proto__ || Object.getPrototypeOf(o);
                          };
                    return _getPrototypeOf(o);
                }

                function _templateObject2() {
                    var data = _taggedTemplateLiteral([
                        '<span style="pointer-events: none; border-bottom: 2px dotted red; position: absolute; left: ',
                        "px; top: ",
                        "px; width: ",
                        "px; height: ",
                        'px;"></span>'
                    ]);

                    _templateObject2 = function _templateObject2() {
                        return data;
                    };

                    return data;
                }

                function _templateObject() {
                    var data = _taggedTemplateLiteral([
                        '<span style="pointer-events: none; border: 2px dotted red; position: absolute; left: ',
                        "px; top: ",
                        "px; width: ",
                        "px; height: ",
                        'px;"></span>'
                    ]);

                    _templateObject = function _templateObject() {
                        return data;
                    };

                    return data;
                }

                function _taggedTemplateLiteral(strings, raw) {
                    if (!raw) {
                        raw = strings.slice(0);
                    }
                    return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } }));
                }

                var __importDefault =
                    (this && this.__importDefault) ||
                    function (mod) {
                        return mod && mod.__esModule
                            ? mod
                            : {
                                  default: mod
                              };
                    };

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.TextCheckerElement = void 0;

                var text_caret_pos_1 = __importDefault(require("text-caret-pos"));

                var lit_html_1 = require("lit-html");

                var textchecker_store_1 = require("./textchecker-store");

                var Marker = function Marker(rect) {
                    var isHighLight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                    if (isHighLight) {
                        return lit_html_1.html(_templateObject(), rect.left, rect.top, rect.width, rect.height);
                    } else {
                        return lit_html_1.html(_templateObject2(), rect.left, rect.top, rect.width, rect.height);
                    }
                };

                var TextCheckerElement = /*#__PURE__*/ (function (_HTMLElement) {
                    _inherits(TextCheckerElement, _HTMLElement);

                    var _super = _createSuper(TextCheckerElement);

                    function TextCheckerElement(args) {
                        var _this;

                        _classCallCheck(this, TextCheckerElement);

                        _this = _super.call(this);
                        _this.mouseStateMap = new Map();
                        _this.rectItems = [];
                        _this.annotationItems = [];

                        _this.renderAnnotationMarkers = function (state) {
                            var items = state.rectItems.map(function (rect) {
                                return Marker(rect, state.highlightRectIdSet.has(rect.index));
                            });
                            lit_html_1.render(items, _this.annotationBox);
                        };

                        _this.onMouseUpdate = function (event) {
                            var _a, _b;

                            var clientRect =
                                (_b =
                                    (_a = event.currentTarget) === null || _a === void 0
                                        ? void 0
                                        : _a.getBoundingClientRect()) !== null && _b !== void 0
                                    ? _b
                                    : {
                                          left: 0,
                                          top: 0
                                      };
                            var point = {
                                x: event.clientX - clientRect.left,
                                y: event.clientY - clientRect.top
                            };

                            var isIncludedIndexes = _this.rectItems
                                .filter(function (rect) {
                                    return (
                                        rect.left <= point.x &&
                                        point.x <= rect.left + rect.width &&
                                        rect.top <= point.y &&
                                        point.y <= rect.top + rect.height
                                    );
                                })
                                .map(function (item) {
                                    return item.index;
                                }); // call mouseover

                            _this.rectItems.forEach(function (item) {
                                var _a, _b;

                                var currentState = _this.mouseStateMap.get(item.index);

                                var isIncludedMouse = isIncludedIndexes.includes(item.index);

                                if (currentState === false && isIncludedMouse) {
                                    (_a = _this.annotationItems[item.index]) === null || _a === void 0
                                        ? void 0
                                        : _a.onMouseEnter();
                                } else if (currentState === true && !isIncludedMouse) {
                                    (_b = _this.annotationItems[item.index]) === null || _b === void 0
                                        ? void 0
                                        : _b.onMouseLeave();
                                }

                                _this.mouseStateMap.set(item.index, isIncludedMouse);
                            }); // update highlight

                            _this.store.highlightRectIndexes(isIncludedIndexes);
                        };

                        _this.target = args.target;
                        _this.store = textchecker_store_1.createTextCheckerStore();
                        return _this;
                    }

                    _createClass(TextCheckerElement, [
                        {
                            key: "connectedCallback",
                            value: function connectedCallback() {
                                var _this2 = this;

                                var targetSelector = this.target;

                                if (!targetSelector) {
                                    throw new Error("target attribute should be defined");
                                }

                                var target = document.querySelector(targetSelector);

                                if (!target) {
                                    throw new Error("target element is not found");
                                }

                                this.targetElement = target;
                                var shadow = this.attachShadow({
                                    mode: "open"
                                });
                                var overlay = document.createElement("div");
                                overlay.setAttribute(
                                    "style",
                                    "border: 1px dotted blue; position: absolute; top: 0px; left: 0px; pointer-events: none;"
                                );
                                var annotationBox = document.createElement("div");
                                overlay.append(annotationBox);
                                shadow.append(overlay);
                                this.annotationBox = annotationBox;
                                this.targetElement.addEventListener("mousemove", this.onMouseUpdate);
                                this.store.onChange(function () {
                                    _this2.renderAnnotationMarkers(_this2.store.get());
                                });
                            }
                        },
                        {
                            key: "updateAnnotations",
                            value: function updateAnnotations(annotationItems) {
                                var _this3 = this;

                                var target = this.targetElement;
                                var targetStyle = window.getComputedStyle(target);
                                var copyAttributes = [
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
                                var copyStyle = copyAttributes
                                    .map(function (attr) {
                                        return "".concat(attr, ": ").concat(targetStyle.getPropertyValue(attr), ";");
                                    })
                                    .join("");
                                this.annotationBox.setAttribute("style", copyStyle + "pointer-events: none;"); //

                                var rectItems = annotationItems.flatMap(function (annotation, index) {
                                    var _a, _b, _c, _d, _e, _f;

                                    var start = annotation.start;
                                    var end = annotation.end; // 0 start

                                    var startCoordinate = text_caret_pos_1.default.getCoordinates(
                                        _this3.targetElement,
                                        start,
                                        {
                                            reuse: true,
                                            returnHeight: true,
                                            returnDiv: true,
                                            debug: true
                                        }
                                    );
                                    var endCoordinate = text_caret_pos_1.default.getCoordinates(
                                        _this3.targetElement,
                                        end,
                                        {
                                            reuse: true,
                                            returnHeight: true,
                                            returnDiv: true,
                                            debug: true
                                        }
                                    );
                                    var fontSize = Number(targetStyle.getPropertyValue("font-size").replace("px", ""));
                                    var rectItems =
                                        startCoordinate.top === endCoordinate.top
                                            ? [
                                                  {
                                                      index: index,
                                                      left:
                                                          target.offsetLeft - target.scrollLeft + startCoordinate.left,
                                                      top: target.offsetTop - target.scrollTop + startCoordinate.top,
                                                      height: fontSize,
                                                      width: endCoordinate.left - startCoordinate.left
                                                  }
                                              ] // two line
                                            : [
                                                  {
                                                      index: index,
                                                      left:
                                                          target.offsetLeft - target.scrollLeft + startCoordinate.left,
                                                      top: target.offsetTop - target.scrollTop + startCoordinate.top,
                                                      height: fontSize,
                                                      width:
                                                          ((_c =
                                                              (_b =
                                                                  (_a =
                                                                      startCoordinate === null ||
                                                                      startCoordinate === void 0
                                                                          ? void 0
                                                                          : startCoordinate._div) === null ||
                                                                  _a === void 0
                                                                      ? void 0
                                                                      : _a.getBoundingClientRect()) === null ||
                                                              _b === void 0
                                                                  ? void 0
                                                                  : _b.width) !== null && _c !== void 0
                                                              ? _c
                                                              : 0) - startCoordinate.left
                                                  },
                                                  {
                                                      index: index,
                                                      left: target.offsetLeft - target.scrollLeft,
                                                      top: target.offsetTop - target.scrollTop + endCoordinate.top,
                                                      height: fontSize,
                                                      width:
                                                          ((_f =
                                                              (_e =
                                                                  (_d =
                                                                      startCoordinate === null ||
                                                                      startCoordinate === void 0
                                                                          ? void 0
                                                                          : startCoordinate._div) === null ||
                                                                  _d === void 0
                                                                      ? void 0
                                                                      : _d.getBoundingClientRect()) === null ||
                                                              _e === void 0
                                                                  ? void 0
                                                                  : _e.left) !== null && _f !== void 0
                                                              ? _f
                                                              : 0) + endCoordinate.left
                                                  }
                                              ];
                                    return rectItems;
                                });
                                this.store.update({
                                    annotationItems: annotationItems,
                                    rectItems: rectItems
                                });
                            }
                        }
                    ]);

                    return TextCheckerElement;
                })(/*#__PURE__*/ _wrapNativeSuper(HTMLElement));

                exports.TextCheckerElement = TextCheckerElement;

                if (!window.customElements.get("textchecker-element")) {
                    window.customElements.define("textchecker-element", TextCheckerElement);
                }
            },
            {
                "text-caret-pos": "../../../node_modules/text-caret-pos/index.js",
                "lit-html": "../../../node_modules/lit-html/lit-html.js",
                "./textchecker-store": "../src/textchecker-store.ts"
            }
        ],
        "index.ts": [
            function (require, module, exports) {
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });

                var textchecker_element_1 = require("../src/textchecker-element");

                var target = document.querySelector("#js-target");
                var textChecker = new textchecker_element_1.TextCheckerElement({
                    target: "#js-target"
                });
                target.before(textChecker);
                var count = 0;
                setInterval(function () {
                    textChecker.updateAnnotations([
                        {
                            start: 0,
                            end: count++,
                            onMouseEnter: function onMouseEnter() {
                                console.log("enteR", count);
                            },
                            onMouseLeave: function onMouseLeave() {
                                console.log("leave", count);
                            }
                        }
                    ]);
                }, 1000);
            },
            { "../src/textchecker-element": "../src/textchecker-element.ts" }
        ],
        "../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js": [
            function (require, module, exports) {
                var global = arguments[3];
                var OVERLAY_ID = "__parcel__error__overlay__";
                var OldModule = module.bundle.Module;

                function Module(moduleName) {
                    OldModule.call(this, moduleName);
                    this.hot = {
                        data: module.bundle.hotData,
                        _acceptCallbacks: [],
                        _disposeCallbacks: [],
                        accept: function (fn) {
                            this._acceptCallbacks.push(fn || function () {});
                        },
                        dispose: function (fn) {
                            this._disposeCallbacks.push(fn);
                        }
                    };
                    module.bundle.hotData = null;
                }

                module.bundle.Module = Module;
                var checkedAssets, assetsToAccept;
                var parent = module.bundle.parent;

                if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
                    var hostname = "" || location.hostname;
                    var protocol = location.protocol === "https:" ? "wss" : "ws";
                    var ws = new WebSocket(protocol + "://" + hostname + ":" + "56656" + "/");

                    ws.onmessage = function (event) {
                        checkedAssets = {};
                        assetsToAccept = [];
                        var data = JSON.parse(event.data);

                        if (data.type === "update") {
                            var handled = false;
                            data.assets.forEach(function (asset) {
                                if (!asset.isNew) {
                                    var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

                                    if (didAccept) {
                                        handled = true;
                                    }
                                }
                            }); // Enable HMR for CSS by default.

                            handled =
                                handled ||
                                data.assets.every(function (asset) {
                                    return asset.type === "css" && asset.generated.js;
                                });

                            if (handled) {
                                console.clear();
                                data.assets.forEach(function (asset) {
                                    hmrApply(global.parcelRequire, asset);
                                });
                                assetsToAccept.forEach(function (v) {
                                    hmrAcceptRun(v[0], v[1]);
                                });
                            } else if (location.reload) {
                                // `location` global exists in a web worker context but lacks `.reload()` function.
                                location.reload();
                            }
                        }

                        if (data.type === "reload") {
                            ws.close();

                            ws.onclose = function () {
                                location.reload();
                            };
                        }

                        if (data.type === "error-resolved") {
                            console.log("[parcel] ✨ Error resolved");
                            removeErrorOverlay();
                        }

                        if (data.type === "error") {
                            console.error("[parcel] 🚨  " + data.error.message + "\n" + data.error.stack);
                            removeErrorOverlay();
                            var overlay = createErrorOverlay(data);
                            document.body.appendChild(overlay);
                        }
                    };
                }

                function removeErrorOverlay() {
                    var overlay = document.getElementById(OVERLAY_ID);

                    if (overlay) {
                        overlay.remove();
                    }
                }

                function createErrorOverlay(data) {
                    var overlay = document.createElement("div");
                    overlay.id = OVERLAY_ID; // html encode message and stack trace

                    var message = document.createElement("div");
                    var stackTrace = document.createElement("pre");
                    message.innerText = data.error.message;
                    stackTrace.innerText = data.error.stack;
                    overlay.innerHTML =
                        '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' +
                        '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' +
                        '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' +
                        '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' +
                        message.innerHTML +
                        "</div>" +
                        "<pre>" +
                        stackTrace.innerHTML +
                        "</pre>" +
                        "</div>";
                    return overlay;
                }

                function getParents(bundle, id) {
                    var modules = bundle.modules;

                    if (!modules) {
                        return [];
                    }

                    var parents = [];
                    var k, d, dep;

                    for (k in modules) {
                        for (d in modules[k][1]) {
                            dep = modules[k][1][d];

                            if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
                                parents.push(k);
                            }
                        }
                    }

                    if (bundle.parent) {
                        parents = parents.concat(getParents(bundle.parent, id));
                    }

                    return parents;
                }

                function hmrApply(bundle, asset) {
                    var modules = bundle.modules;

                    if (!modules) {
                        return;
                    }

                    if (modules[asset.id] || !bundle.parent) {
                        var fn = new Function("require", "module", "exports", asset.generated.js);
                        asset.isNew = !modules[asset.id];
                        modules[asset.id] = [fn, asset.deps];
                    } else if (bundle.parent) {
                        hmrApply(bundle.parent, asset);
                    }
                }

                function hmrAcceptCheck(bundle, id) {
                    var modules = bundle.modules;

                    if (!modules) {
                        return;
                    }

                    if (!modules[id] && bundle.parent) {
                        return hmrAcceptCheck(bundle.parent, id);
                    }

                    if (checkedAssets[id]) {
                        return;
                    }

                    checkedAssets[id] = true;
                    var cached = bundle.cache[id];
                    assetsToAccept.push([bundle, id]);

                    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
                        return true;
                    }

                    return getParents(global.parcelRequire, id).some(function (id) {
                        return hmrAcceptCheck(global.parcelRequire, id);
                    });
                }

                function hmrAcceptRun(bundle, id) {
                    var cached = bundle.cache[id];
                    bundle.hotData = {};

                    if (cached) {
                        cached.hot.data = bundle.hotData;
                    }

                    if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
                        cached.hot._disposeCallbacks.forEach(function (cb) {
                            cb(bundle.hotData);
                        });
                    }

                    delete bundle.cache[id];
                    bundle(id);
                    cached = bundle.cache[id];

                    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
                        cached.hot._acceptCallbacks.forEach(function (cb) {
                            cb();
                        });

                        return true;
                    }
                }
            },
            {}
        ]
    },
    {},
    ["../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js", "index.ts"],
    null
);
//# sourceMappingURL=/public.77de5100.js.map
