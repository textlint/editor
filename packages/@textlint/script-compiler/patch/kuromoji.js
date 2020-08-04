/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";
const { openStorage } = require("@textlint/runtime-helper");
var zlib = require("zlibjs/bin/gunzip.min.js");
var DictionaryLoader = require("kuromoji/src/loader/DictionaryLoader");
//=== Modify kuromoji.js's browser loader
const dictionaryStorage = openStorage("kuromoji");
const urlMap = new Map();
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
/**
 * BrowserDictionaryLoader inherits DictionaryLoader, using jQuery XHR for download
 * @param {string} dic_path Dictionary path
 * @constructor
 */
function BrowserDictionaryLoader(dic_path) {
    DictionaryLoader.apply(this, [dic_path]);
}

BrowserDictionaryLoader.prototype = Object.create(DictionaryLoader.prototype);

/**
 * Utility function to load gzipped dictionary
 * @param {string} url Dictionary URL
 * @param {BrowserDictionaryLoader~onLoad} callback Callback function
 */
BrowserDictionaryLoader.prototype.loadArrayBuffer = async function (url, callback) {
    // https://github.com/takuyaa/kuromoji.js/issues/37
    const fixedURL = url.replace("https:/", "https://");
    const cachedDictBuffer = await dictionaryStorage.get(fixedURL);
    if (cachedDictBuffer) {
        // console.log("return cache", cachedDictBuffer);
        return callback(null, cachedDictBuffer);
    }
    // Suppress multiple request to same url at same time
    if (urlMap.has(fixedURL)) {
        return urlMap
            .get(fixedURL)
            .promise.then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error);
            });
    }
    const deferred = new Deferred();
    urlMap.set(fixedURL, deferred);
    fetch(fixedURL)
        .then(function (response) {
            if (!response.ok) {
                return callback(response.statusText, null);
            }
            response.arrayBuffer().then(function (arraybuffer) {
                var gz = new zlib.Zlib.Gunzip(new Uint8Array(arraybuffer));
                var typed_array = gz.decompress();
                return dictionaryStorage.set(fixedURL, typed_array.buffer).then(() => {
                    // console.log("cached", fixedURL);
                    deferred.resolve(typed_array.buffer);
                    callback(null, typed_array.buffer);
                });
            });
        })
        .catch(function (exception) {
            deferred.reject(exception);
            callback(exception, null);
        });
};
/**
 * Callback
 * @callback BrowserDictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {Uint8Array} buffer Loaded buffer
 */

module.exports = BrowserDictionaryLoader;
