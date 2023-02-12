import { TextlintConfigDescriptor } from "@textlint/config-loader";
import type { TextlintFixResult, TextlintResult } from "@textlint/types";
import { TextlintScriptMetadata } from "@textlint/script-parser";

export type TextlintWorkerCommandLint = {
    command: "lint";
    text: string;
    ruleId?: string;
};
export type TextlintWorkerCommandFix = {
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
    command: "lint:result";
    result: TextlintResult;
};
export type TextlintWorkerCommandResponseFix = {
    command: "fix:result";
    result: TextlintFixResult;
};
export type TextlintWorkerCommandResponse =
    | TextlintWorkerCommandResponseInit
    | TextlintWorkerCommandResponseLint
    | TextlintWorkerCommandResponseFix;

export const generateCode = async (config: TextlintConfigDescriptor) => {
    // macro
    // !__moduleInterop(require('${rule.moduleName}').rules['${ruleName}'])__! -> moduleInterop(require('${rule.moduleName}').rules['${ruleName}'])
    const stringify = (item: any[]): string => {
        // unwrap code
        return JSON.stringify(item, null, 4).replace(/"!__(.*)__!"/g, (_, code) => {
            return code.replaceAll(/\\/g, "");
        });
    };

    return `// Generated webworker code by textlint-script-compiler
import { TextlintKernel } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
import { parseOptionsFromConfig } from "@textlint/config-partial-parser"
const kernel = new TextlintKernel();
const rules = ${stringify(
        config.rules.flatMap((rule) => {
            const [_presetName, ruleName] = rule.ruleId.split("/");
            return {
                ruleId: rule.ruleId,
                rule: ruleName
                    ? `!__moduleInterop(require('${rule.moduleName}').rules['${ruleName}'])__!`
                    : `!__moduleInterop(require('${rule.filePath}'))__!`,
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
                return self.postMessage({
                    command: "lint:result",
                    result
                });
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
                    command: "fix:result",
                    result
                });
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
