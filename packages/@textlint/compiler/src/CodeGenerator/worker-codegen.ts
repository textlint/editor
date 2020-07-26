import { loadConfig } from "@textlint/config-loader";
import { CodeGeneraterOptions } from "./CodeGeneraterOptions";

export const generateCode = async (options: CodeGeneraterOptions) => {
    const configResult = await loadConfig({
        cwd: options.cwd,
        configFilePath: options.configFilePath,
        preLoadingPackage: (packageOptions) => {
            // TODO: default plugin handling?
            packageOptions.rawConfig.plugins = Array.isArray(packageOptions.rawConfig?.plugins)
                ? ["@textlint/text", "@textlint/markdown"].concat(packageOptions.rawConfig?.plugins ?? [])
                : {
                    "@textlint/text": true,
                    "@textlint/markdown": true,
                    ...packageOptions.rawConfig?.plugins
                }
            return packageOptions
        }
    });
    if (configResult.ok === false) {
        console.error(configResult.error.message, configResult.error.errors);
        throw new Error(configResult.error.message);
    }
    const {config} = configResult;
    const stringify = (item: any[]): string => {
        // unwrap code
        return JSON.stringify(item, null, 4)
            .replace(/"(moduleInterop\(require\('.*?'\)\))"/g, "$1")
            .replace(/"(presetToKernelRules\(.+\))"/g, "$1")
    }

    return `// Generated webworker code by textlint-compiler
import { TextlintKernel } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
import { presetToKernelRules, openStorage } from "@textlint/runtime-helper"
const kernel = new TextlintKernel();
const presetRules = ${stringify(config.presets.map(preset => {
        return `presetToKernelRules(moduleInterop(require('${preset.moduleName}')), '${preset.id}')`;
    }))}.flat();
const rules = ${stringify(config.rules.flatMap(rule => {
        return {
            ruleId: rule.ruleId,
            rule: `moduleInterop(require('${rule.moduleName}'))`,
            options: rule.options
        }
    }))};
const filterRules = ${stringify(config.filterRules.map(rule => {
        return {
            ruleId: rule.ruleId,
            rule: `moduleInterop(require('${rule.moduleName}'))`,
            options: rule.options
        }
    }))};
const plugins = ${stringify(config.plugins.map(plugin => {
        return {
            pluginId: plugin.pluginId,
            plugin: `moduleInterop(require('${plugin.moduleName}'))`,
            options: plugin.options
        }
    }))};


const allRules = rules.concat(presetRules);
self.addEventListener('message', (event) => {
    var data = event.data;
    switch (data.command) {
        case "lint":
            return kernel.lintText(data.text, {
                rules: allRules,
                filterRules: filterRules,
                plugins: plugins,
                filePath: "/path/to/README" + data.ext,
                ext: data.ext,
            }).then(result => {
                return self.postMessage({
                    command: "lint:result",
                    result
                });
            });
        default:
            console.log("Unknown command" + data.command);
    }
});

//=== Modify kuromoji.js's browser loader
const dictionaryStorage = openStorage("kuromoji");
const BrowserDictionaryLoader = require("kuromoji/src/loader/BrowserDictionaryLoader");
const zlib = require("zlibjs/bin/gunzip.min.js");
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
// InMemory Cache
const dictionaryDeferred = new Deferred();
const urlMap = new Map();
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
        return urlMap.get(fixedURL).promise.then(result => {
            callback(null, result);
        }).catch(error => {
            callback(error);
        });
    }
    const deferred = new Deferred();
    urlMap.set(fixedURL, deferred);
    fetch(fixedURL).then(function (response) {
        if (!response.ok){
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
    }).catch(function (exception) {
        deferred.reject(exception);
        callback(exception, null);
    });
};
// ====
self.postMessage({
    command: "init"
});
`;
}
