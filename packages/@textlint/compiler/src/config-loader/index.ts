import { rcFile } from "rc-config-loader";
import type {
    TextlintKernelRule,
    TextlintFilterRuleReporter,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintPluginCreator
} from "@textlint/kernel";
import type { TextlintRuleModule } from "@textlint/types";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { moduleInterop } from "@textlint/module-interop";
import { isPresetRuleKey } from "./config-util";
import { loadRulesConfigFromPresets } from "./preset-loader";

type TextlintRcConfig = {
    plugins:
        | string[]
        | {
              [index: string]: boolean | {};
          };
    filters: {
        [index: string]: boolean | {};
    };
    rules: {
        [index: string]: boolean | {};
    };
};
// Probably samw with TextlintKernelOptions
type TextlintConfigDescriptor = {
    // plugins
    plugins: TextlintKernelPlugin[];
    // rules
    rules: TextlintKernelRule[];
    // filterRules
    filterRules: TextlintKernelFilterRule[];
};
export type TextlintConfigLoaderOptions = {
    cwd?: string;
    configFilePath?: string;
    // For debugging
    /**
     * node_modules directory path
     * Default: undefined
     */
    node_moduleDir?: string;
    /**
     * This definitions replace id to rule module
     * It is useful for replacing specific ruleId with specific rule module.
     * Main use-case is tester.
     */
    testReplaceDefinitions?: {
        rule?: {
            id: string;
            rule: TextlintRuleModule;
        }[];
        filterRules?: {
            id: string;
            rule: TextlintFilterRuleReporter;
        }[];
        plugins?: {
            id: string;
            plugin: TextlintPluginCreator;
        }[];
    };
};
export type TextlintLintConfigLoaderResult =
    | {
          ok: true;
          config: TextlintConfigDescriptor; // Core Option object
          configFilePath: string;
      }
    | {
          // load config error
          ok: false;
          configFilePath?: string;
          rawConfig?: TextlintRcConfig;
          error: {
              message: string;
              errors: Error[];
          };
      };

export type TextlintConfigLoaderRawResult =
    | {
          ok: true;
          configFilePath: string;
          rawConfig: TextlintRcConfig;
      }
    | {
          ok: false;
          error: {
              message: string;
              errors: Error[];
          };
      };
export type TextlintLoadPackagesFromRawConfigOptions = {
    /**
     * Loaded config object
     */
    rawConfig: TextlintRcConfig;
    /**
     * node_modules directory path
     * Default: undefined
     */
    node_moduleDir?: string;
    /**
     * This definitions replace id to rule module
     * It is useful for replacing specific ruleId with specific rule module.
     * Main use-case is tester.
     */
    testReplaceDefinitions?: {
        rule?: {
            id: string;
            rule: TextlintRuleModule;
        }[];
        filterRules?: {
            id: string;
            rule: TextlintFilterRuleReporter;
        }[];
        plugins?: {
            id: string;
            plugin: TextlintPluginCreator;
        }[];
    };
};
export type TextlintLoadPackagesFromRawConfigResult =
    | {
          ok: true;
          config: TextlintConfigDescriptor; // Core Option object
      }
    | {
          // load config error
          ok: false;
          error: {
              message: string;
              errors: Error[];
          };
      };

const loadPlugins = ({
    pluginsObject,
    moduleResolver,
    options
}: {
    pluginsObject: TextlintRcConfig["plugins"];
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    options: TextlintLoadPackagesFromRawConfigOptions;
}): {
    plugins: TextlintKernelPlugin[];
    pluginsError: null | {
        message: string;
        errors: Error[];
    };
} => {
    // rules
    const pluginErrors: Error[] = [];
    const plugins: TextlintKernelPlugin[] = [];
    if (Array.isArray(pluginsObject)) {
        // { plugins: ["a", "b"] }
        pluginsObject.forEach((pluginId) => {
            const plugin = moduleInterop(require(moduleResolver.resolvePluginPackageName(pluginId)));
            plugins.push({
                pluginId: pluginId,
                plugin
            });
        });
    } else {
        // { plugins: { "a": true, "b": options } }
        Object.entries(pluginsObject).forEach(([pluginId, pluginOptions]) => {
            try {
                // Test Replace logic
                const replacedDefinition =
                    options.testReplaceDefinitions &&
                    options.testReplaceDefinitions.plugins &&
                    options.testReplaceDefinitions.plugins.find(({ id }) => {
                        return id === pluginId;
                    });
                // TODO: any to be remove
                const pluginModule: any = replacedDefinition
                    ? replacedDefinition.plugin
                    : moduleInterop(require(moduleResolver.resolvePluginPackageName(pluginId)));
                // plugin
                plugins.push({
                    pluginId: pluginId,
                    plugin: pluginModule,
                    options: pluginOptions
                });
            } catch (error) {
                pluginErrors.push(error);
            }
        });
    }
    return {
        plugins,
        pluginsError:
            pluginErrors.length === 0
                ? null
                : {
                      message: "Can not load plugin",
                      errors: pluginErrors
                  }
    };
};

const loadFilterRules = ({
    rulesObject,
    moduleResolver,
    options
}: {
    rulesObject: TextlintRcConfig["filters"];
    moduleResolver: TextLintModuleResolver;
    options: TextlintLoadPackagesFromRawConfigOptions;
}): {
    filterRules: TextlintKernelFilterRule[];
    filterRulesError: null | {
        message: string;
        errors: Error[];
    };
} => {
    // rules
    const rules: TextlintKernelFilterRule[] = [];
    const ruleErrors: Error[] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        try {
            // Test Replace logic
            const replacedDefinition =
                options.testReplaceDefinitions &&
                options.testReplaceDefinitions.filterRules &&
                options.testReplaceDefinitions.filterRules.find(({ id }) => {
                    return id === ruleId;
                });
            // TODO: any to be remove
            const ruleModule: any = replacedDefinition
                ? replacedDefinition.rule
                : moduleInterop(require(moduleResolver.resolveFilterRulePackageName(ruleId)));
            // rule
            rules.push({
                ruleId: ruleId,
                rule: ruleModule,
                options: ruleOptions
            });
        } catch (error) {
            ruleErrors.push(error);
        }
    });
    return {
        filterRules: rules,
        filterRulesError:
            ruleErrors.length === 0
                ? null
                : {
                      message: "Can not load filter rule",
                      errors: ruleErrors
                  }
    };
};

const loadRules = ({
    parentPresetName,
    rulesObject,
    moduleResolver,
    options
}: {
    rulesObject: TextlintRcConfig["rules"];
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    options: TextlintLoadPackagesFromRawConfigOptions;
}): {
    rules: TextlintKernelRule[];
    rulesError: null | {
        message: string;
        errors: Error[];
    };
} => {
    // rules
    const rules: TextlintKernelRule[] = [];
    const ruleErrors: Error[] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        try {
            // Test Replace logic
            const replacedDefinition =
                options.testReplaceDefinitions &&
                options.testReplaceDefinitions.rule &&
                options.testReplaceDefinitions.rule.find(({ id }) => {
                    return id === ruleId;
                });
            // TODO: any to be remove
            const ruleModule: any = replacedDefinition
                ? replacedDefinition.rule
                : moduleInterop(require(moduleResolver.resolveRulePackageName(ruleId)));
            if (isPresetRuleKey(ruleId)) {
                // preset
                const presetRuleObject = loadRulesConfigFromPresets([ruleId], moduleResolver);
                const { rules, rulesError } = loadRules({
                    parentPresetName: ruleId,
                    rulesObject: presetRuleObject,
                    moduleResolver,
                    options
                });
                if (rulesError) {
                    rulesError.errors.forEach((error) => {
                        ruleErrors.push(error);
                    });
                } else {
                    rules.forEach((rule) => {
                        rules.push(rule);
                    });
                }
            } else {
                const normalizedKey = parentPresetName
                    ? // preset-name/rule-name
                      normalizeTextlintPresetSubRuleKey({
                          preset: parentPresetName,
                          rule: ruleId
                      })
                    : ruleId;
                // rule
                rules.push({
                    ruleId: normalizedKey,
                    rule: ruleModule,
                    options: ruleOptions
                });
            }
        } catch (error) {
            ruleErrors.push(error);
        }
    });
    return {
        rules,
        rulesError:
            ruleErrors.length === 0
                ? null
                : {
                      message: "Can not load rule",
                      errors: ruleErrors
                  }
    };
};
/**
 * Load packages in RawConfig and return loaded config object
 * @param options
 */
export const loadPackagesFromRawConfig = (
    options: TextlintLoadPackagesFromRawConfigOptions
): TextlintLoadPackagesFromRawConfigResult => {
    // TODO: validation
    // Search textlint's module
    const moduleResolver = new TextLintModuleResolver({
        rulesBaseDirectory: options.node_moduleDir
    });
    // rules
    const { rules, rulesError } = loadRules({
        rulesObject: options.rawConfig.rules,
        options,
        moduleResolver
    });
    // filterRules
    const { filterRules, filterRulesError } = loadFilterRules({
        rulesObject: options.rawConfig.filters,
        options,
        moduleResolver
    });
    // plugins
    const { plugins, pluginsError } = loadPlugins({
        pluginsObject: options.rawConfig.plugins,
        options,
        moduleResolver
    });
    if (rulesError) {
        return {
            ok: false,
            error: rulesError
        };
    }
    if (filterRulesError) {
        return {
            ok: false,
            error: filterRulesError
        };
    }
    if (pluginsError) {
        return {
            ok: false,
            error: pluginsError
        };
    }
    const loadedConfig: TextlintConfigDescriptor = {
        rules,
        plugins,
        filterRules
    };
    // TODO: after validation
    return {
        ok: true,
        config: loadedConfig
    };
};
/**
 *  Load config file and return config object that is loaded rule instance.
 * @param options
 */
export const loadConfig = (options: TextlintConfigLoaderOptions): TextlintLintConfigLoaderResult => {
    const rawResult = loadRawConfig(options);
    if (!rawResult.ok) {
        return {
            ok: false,
            error: rawResult.error
        };
    }
    const result = loadPackagesFromRawConfig({
        rawConfig: rawResult.rawConfig,
        node_moduleDir: options.node_moduleDir,
        testReplaceDefinitions: options.testReplaceDefinitions
    });
    if (!result.ok) {
        return {
            ok: false,
            configFilePath: rawResult.configFilePath,
            error: result.error
        };
    }
    return {
        ok: true,
        config: result.config,
        configFilePath: rawResult.configFilePath
    };
};
/**
 *  Load config file and return config object that is not loaded rule instance
 *  It is just JSON present for config file. Raw data
 * @param options
 */
export const loadRawConfig = (options: TextlintConfigLoaderOptions): TextlintConfigLoaderRawResult => {
    try {
        const results = rcFile<TextlintRcConfig>("textlint", {
            cwd: options.cwd,
            configFileName: options.configFilePath,
            packageJSON: {
                fieldName: "textlint"
            }
        });
        // Not Found
        if (!results) {
            return {
                ok: false,
                error: {
                    message: "textlint config is not found",
                    errors: [
                        new Error(`textlint config is not found
                
textlint require .textlintrc config file.
The config file define the use of rules.`)
                    ]
                }
            };
        }
        return {
            ok: true,
            rawConfig: results.config,
            configFilePath: results.filePath
        };
    } catch (error) {
        return {
            ok: false,
            error: {
                message: "textlint config is not found",
                errors: [error]
            }
        };
    }
};
