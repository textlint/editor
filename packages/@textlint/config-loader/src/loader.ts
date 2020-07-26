import { TextLintModuleResolver } from "./textlint-module-resolver";
import { isPresetRuleKey } from "./config-util";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { moduleInterop } from "@textlint/module-interop";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";

export const loadPlugins = ({
                                pluginsObject,
                                moduleResolver,
                                testReplaceDefinitions
                            }: {
    pluginsObject: NonNullable<TextlintRcConfig["plugins"]>;
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["plugins"];
}): {
    plugins: TextlintConfigDescriptor["plugins"];
    pluginsError: null | {
        message: string;
        errors: Error[];
    };
} => {
    const plugins: TextlintConfigDescriptor["plugins"] = [];
    const pluginErrors: Error[] = [];
    if (Array.isArray(pluginsObject)) {
        // { plugins: ["a", "b"] }
        pluginsObject.forEach((pluginId) => {
            const resolvedModule = moduleResolver.resolvePluginPackageName(pluginId);
            const plugin = moduleInterop(require(resolvedModule.filePath));
            plugins.push({
                pluginId: pluginId,
                plugin,
                filePath: resolvedModule.filePath,
                moduleName: resolvedModule.moduleName
            });
        });
    } else {
        // { plugins: { "a": true, "b": options } }
        Object.entries(pluginsObject).forEach(([pluginId, pluginOptions]) => {
            try {
                // Test Replace logic
                const replacedDefinition =
                    testReplaceDefinitions &&
                    testReplaceDefinitions.find((definition) => {
                        return definition.pluginId === pluginId;
                    });
                if (replacedDefinition) {
                    // for debug
                    plugins.push(replacedDefinition);
                } else {
                    const resolvedPlugin = moduleResolver.resolvePluginPackageName(pluginId);
                    const pluginModule = moduleInterop(require(resolvedPlugin.filePath));
                    plugins.push({
                        pluginId: pluginId,
                        plugin: pluginModule,
                        options: pluginOptions,
                        filePath: resolvedPlugin.filePath,
                        moduleName: resolvedPlugin.moduleName
                    });
                }
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
    rulesObject: NonNullable<TextlintRcConfig["filters"]>;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["filterRules"];
}): {
    filterRules: TextlintConfigDescriptor["filterRules"];
    filterRulesError: null | {
        message: string;
        errors: Error[];
    };
} => {
    // rules
    const rules: TextlintConfigDescriptor["filterRules"] = [];
    const ruleErrors: Error[] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        try {
            // Test Replace logic
            const replacedDefinition =
                testReplaceDefinitions &&
                testReplaceDefinitions.find((definition) => {
                    return definition.ruleId === ruleId;
                });
            if (replacedDefinition) {
                // for debug
                rules.push(replacedDefinition);
            } else {
                const resolvePackage = moduleResolver.resolveFilterRulePackageName(ruleId);
                const ruleModule = moduleInterop(require(resolvePackage.filePath));
                // rule
                rules.push({
                    ruleId: ruleId,
                    rule: ruleModule,
                    options: ruleOptions,
                    filePath: resolvePackage.filePath,
                    moduleName: resolvePackage.moduleName
                });
            }
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
                              rulesObject,
                              moduleResolver,
                              testReplaceDefinitions
                          }: {
    rulesObject: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["rules"];
}): {
    presets: TextlintConfigDescriptor["presets"];
    rules: TextlintConfigDescriptor["rules"];
    rulesError: null | {
        message: string;
        errors: Error[];
    };
} => {
    // rules
    const rules: TextlintConfigDescriptor["rules"] = [];
    const presets: TextlintConfigDescriptor["presets"] = [];
    const ruleErrors: Error[] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        try {
            // Test Replace logic
            const replacedDefinition =
                testReplaceDefinitions &&
                testReplaceDefinitions.find((definition) => {
                    return definition.ruleId === ruleId;
                });
            if (replacedDefinition) {
                // for debug
                rules.push(replacedDefinition);
            } else {
                if (isPresetRuleKey(ruleId)) {
                    // load preset
                    const resolvePackage = moduleResolver.resolvePresetPackageName(ruleId);
                    const ruleModule = moduleInterop(require(resolvePackage.filePath));
                    presets.push({
                        id: ruleId,
                        preset: ruleModule,
                        filePath: resolvePackage.filePath,
                        moduleName: resolvePackage.moduleName
                    });
                } else {
                    // load rule
                    const resolvePackage = moduleResolver.resolveRulePackageName(ruleId);
                    const ruleModule = moduleInterop(require(resolvePackage.filePath));
                    // rule
                    rules.push({
                        ruleId: ruleId,
                        rule: ruleModule,
                        options: ruleOptions,
                        filePath: resolvePackage.filePath,
                        moduleName: resolvePackage.moduleName
                    });
                }
            }
        } catch (error) {
            ruleErrors.push(error);
        }
    });
    return {
        rules,
        presets,
        rulesError:
            ruleErrors.length === 0
                ? null
                : {
                    message: "Can not load rule",
                    errors: ruleErrors
                }
    };
};
