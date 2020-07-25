import type {
    TextlintFilterRuleReporter,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator
} from "@textlint/kernel";
import { TextlintRuleModule } from "@textlint/types";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { isPresetRuleKey } from "./config-util";
import { loadRulesConfigFromPresets } from "./preset-loader";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { moduleInterop } from "@textlint/module-interop";

export const loadPlugins = ({
    pluginsObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    pluginsObject: TextlintRcConfig["plugins"];
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: {
        id: string;
        plugin: TextlintPluginCreator;
    }[];
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
                    testReplaceDefinitions &&
                    testReplaceDefinitions.find(({ id }) => {
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
export const loadFilterRules = ({
    rulesObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    rulesObject: TextlintRcConfig["filters"];
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: {
        id: string;
        rule: TextlintFilterRuleReporter;
    }[];
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
                testReplaceDefinitions &&
                testReplaceDefinitions.find(({ id }) => {
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
export const loadRules = ({
    parentPresetName,
    rulesObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    rulesObject: TextlintRcConfig["rules"];
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: {
        id: string;
        rule: TextlintRuleModule;
    }[];
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
                testReplaceDefinitions &&
                testReplaceDefinitions.find(({ id }) => {
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
                    testReplaceDefinitions
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
