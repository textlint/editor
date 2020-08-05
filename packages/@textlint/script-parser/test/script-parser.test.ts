import assert from "assert";
import { parseMetadata } from "../src/script-parser";

describe("script-parser", function () {
    it("should parse comment", () => {
        const scriptContent = `/*! textlinteditor: {"name":"example","namespace":"https://github.com/textlint/editor","config":{"rules":{"preset-ja-technical-writing":true},"plugins":{"@textlint/text":true,"@textlint/markdown":true}}} */
self.textlint=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=465)}([function(e,t,n){"use strict";(function(t){var r=n(37);`;
        const metadata = parseMetadata(scriptContent);
        assert.deepStrictEqual(metadata, {
            name: "example",
            namespace: "https://github.com/textlint/editor",
            config: {
                rules: { "preset-ja-technical-writing": true },
                plugins: { "@textlint/text": true, "@textlint/markdown": true }
            }
        });
    });
});
