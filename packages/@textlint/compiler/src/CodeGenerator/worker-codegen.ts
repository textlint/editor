import { loadConfig } from "@textlint/config-loader";
import { CodeGeneraterOptions } from "./CodeGeneraterOptions";
import type { TextlintResult, TextlintFixResult } from "@textlint/types";
import type { TextlintKernelRule, TextlintKernelFilterRule, TextlintKernelPlugin } from "@textlint/kernel";

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
    config: {
        rules: Omit<TextlintKernelRule, "rule">[];
        filterRules: Omit<TextlintKernelFilterRule, "rule">[];
        plugins: Omit<TextlintKernelPlugin, "plugin">[];
    };
};
export type TextlintWorkerCommand =
    | TextlintWorkerCommandLint
    | TextlintWorkerCommandFix
    | TextlintWorkerCommandMergeConfig;

export type TextlintWorkerCommandResponseInit = {
    command: "init";
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
                  };
            return packageOptions;
        }
    });
    if (configResult.ok === false) {
        console.error(configResult.error.message, configResult.error.errors);
        throw new Error(configResult.error.message);
    }
    const { config } = configResult;
    const stringify = (item: any[]): string => {
        // unwrap code
        return JSON.stringify(item, null, 4)
            .replace(/"(moduleInterop\(require\('.*?'\)\))"/g, "$1")
            .replace(/"(presetToKernelRules\(.+\))"/g, "$1");
    };

    return `// Generated webworker code by textlint-compiler
import { TextlintKernel } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
import { presetToKernelRules } from "@textlint/runtime-helper"
const kernel = new TextlintKernel();
const presetRules = ${stringify(
        config.presets.map((preset) => {
            return `presetToKernelRules(moduleInterop(require('${preset.moduleName}')), '${preset.id}')`;
        })
    )}.flat();
const rules = ${stringify(
        config.rules.flatMap((rule) => {
            return {
                ruleId: rule.ruleId,
                rule: `moduleInterop(require('${rule.moduleName}'))`,
                options: rule.options
            };
        })
    )};
const filterRules = ${stringify(
        config.filterRules.map((rule) => {
            return {
                ruleId: rule.ruleId,
                rule: `moduleInterop(require('${rule.moduleName}'))`,
                options: rule.options
            };
        })
    )};
const plugins = ${stringify(
        config.plugins.map((plugin) => {
            return {
                pluginId: plugin.pluginId,
                plugin: `moduleInterop(require('${plugin.moduleName}'))`,
                options: plugin.options
            };
        })
    )};
const allRules = rules.concat(presetRules);
const config = {
    rules: allRules,
    filterRules: filterRules,
    plugins: plugins
};
const assignConfig = (overrideConfig) => {
    if (overrideConfig.rules) {
        config.rules = config.rules.map(rule => {
            const override = overrideConfig.rules.find(o => o.ruleId === rule.ruleId);
            return { ...rule, ...override };
        });
    }
    if (overrideConfig.filterRules) {
        config.filterRules = config.filterRules.map(rule => {
            const override = overrideConfig.filterRules.find(o => o.ruleId === rule.ruleId);
            return { ...rule, ...override };
        });
    }
    if (overrideConfig.plugins) {
        config.plugins = config.plugins.map(rule => {
            const override = overrideConfig.plugins.find(o => o.pluginId === rule.pluginId);
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
            return assignConfig(data.config);
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
    command: "init"
});
`;
};
