import { TextlintConfigDescriptor } from "@textlint/config-loader";
import type { TextlintFixResult, TextlintResult } from "@textlint/types";
import { TextlintScriptMetadata } from "@textlint/script-parser";

export type MessageId = string;
export type TextlintWorkerCommandLint = {
    id?: MessageId;
    command: "lint";
    text: string;
    ext: string;
    ruleId?: string;
};
export type TextlintWorkerCommandFix = {
    id?: MessageId;
    command: "fix";
    text: string;
    ext: string;
    ruleId?: string;
};
export type TextlintWorkerCommandMergeConfig = {
    command: "merge-config";
    textlintrc: string;
};
export type TextlintWorkerCommand =
    | TextlintWorkerCommandLint
    | TextlintWorkerCommandFix
    | TextlintWorkerCommandMergeConfig;

export type TextlintWorkerCommandResponseInit = {
    command: "init";
    metadata: TextlintScriptMetadata;
};
export type TextlintWorkerCommandResponseLint = {
    id: MessageId | undefined;
    command: "lint:result";
    result: TextlintResult;
};
export type TextlintWorkerCommandResponseFix = {
    id: MessageId | undefined;
    command: "fix:result";
    result: TextlintFixResult;
};
export type TextlintWorkerCommandResponse =
    | TextlintWorkerCommandResponseInit
    | TextlintWorkerCommandResponseLint
    | TextlintWorkerCommandResponseFix;

export type TextlintErrorOptions = {
    id: MessageId | undefined;
} & ErrorOptions;
export class TextlintError extends Error {
    public id: MessageId | undefined;
    static {
        this.prototype.name = "TextlintError";
    }
    constructor(message: string, options: TextlintErrorOptions = { id: undefined }) {
        const { id, ...errorOptions } = options;
        super(message, errorOptions);
        this.id = id;
    }
}

export const generateCode = async (config: TextlintConfigDescriptor) => {
    // macro replacement
    // !__moduleInterop(require('${rule.moduleName}').rules['${ruleName}'])__! -> moduleInterop(require('${rule.moduleName}').rules['${ruleName}'])
    const stringify = (item: any[]): string => {
        // unwrap code
        return JSON.stringify(item, null, 4).replace(/"!__(.*)__!"/g, "$1");
    };

    return `// Generated webworker code by textlint-script-compiler
import { TextlintKernel } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
import { parseOptionsFromConfig } from "@textlint/config-partial-parser"
import { TextlintError } from "@textlint/script-compiler/module/CodeGenerator/worker-codegen.js"; // FIX ME: to make import smarter
const kernel = new TextlintKernel();
const rules = ${stringify(
        config.rules.flatMap((rule) => {
            return rule.type === "Rule"
                ? {
                      ruleId: rule.ruleId,
                      rule: `!__moduleInterop(require('${rule.filePath}'))__!`,
                      options: rule.options
                  }
                : {
                      ruleId: rule.ruleId,
                      rule: `!__moduleInterop(require('${rule.moduleName}').rules['${rule.ruleKey}'])__!`,
                      options: rule.options
                  };
        })
    )};
const filterRules = ${stringify(
        config.filterRules.map((rule) => {
            return {
                ruleId: rule.ruleId,
                rule: `!__moduleInterop(require('${rule.moduleName}'))__!`,
                options: rule.options
            };
        })
    )};
const plugins = ${stringify(
        config.plugins.map((plugin) => {
            return {
                pluginId: plugin.pluginId,
                plugin: `!__moduleInterop(require('${plugin.moduleName}'))__!`,
                options: plugin.options
            };
        })
    )};
const config = {
    rules: rules,
    filterRules: filterRules,
    plugins: plugins
};
// merge config
const assignConfig = (textlintrc) => {
    const userDefinedConfig = parseOptionsFromConfig(textlintrc);
    if (userDefinedConfig.rules) {
        config.rules = config.rules.map(rule => {
            const override = userDefinedConfig.rules.find(o => o.ruleId === rule.ruleId);
            return { ...rule, ...override };
        });
    }
    if (userDefinedConfig.filterRules) {
        config.filterRules = config.filterRules.map(rule => {
            const override = userDefinedConfig.filterRules.find(o => o.ruleId === rule.ruleId);
            return { ...rule, ...override };
        });
    }
    if (userDefinedConfig.plugins) {
        config.plugins = config.plugins.map(rule => {
            const override = userDefinedConfig.plugins.find(o => o.pluginId === rule.pluginId);
            return { ...rule, ...override };
        });
    }
};
self.addEventListener('message', (event) => {
    const data = event.data;
    const rules = data.ruleId === undefined
        ? config.rules
        : config.rules.filter(rule => rule.ruleId === data.ruleId);
    switch (data.command) {
        case "merge-config":
            return assignConfig(data.textlintrc);
        case "lint":
            return kernel.lintText(data.text, {
                rules: rules,
                filterRules: config.filterRules,
                plugins: config.plugins,
                filePath: "/path/to/README" + data.ext,
                ext: data.ext,
            }).then(result => {
                // return Promise.reject(new TypeError("lintText is not supported")); // for debug
                // throw new Error("something went wrong"); // for debug
                return self.postMessage({
                    id: data.id,
                    command: "lint:result",
                    result
                });
            }).catch(error => {
                const textlintError = new TextlintError("failed to lint text", {
                    id: data.id,
                    cause: error
                });
                reportError(new ErrorEvent("textlint error", { error: textlintError, message: textlintError.message }));
            });
        case "fix":
            return kernel.fixText(data.text, {
                rules: rules,
                filterRules: config.filterRules,
                plugins: config.plugins,
                filePath: "/path/to/README" + data.ext,
                ext: data.ext,
            }).then(result => {
                return self.postMessage({
                    id: data.id,
                    command: "fix:result",
                    result
                });
            }).catch(error => {
                const textlintError = new TextlintError("failed to fix text", {
                    id: data.id,
                    cause: error
                });
                reportError(new ErrorEvent("textlint error", { error: textlintError, message: textlintError.message }));
            });
        default:
            console.log("Unknown command: " + data.command);
    }
});
// ====
self.postMessage({
    command: "init",
    metadata: process.env.TEXTLINT_SCRIPT_METADATA
});
`;
};
