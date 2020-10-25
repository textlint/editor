import { TextLintModuleResolver } from "./textlint-module-resolver";
import { isPresetRuleKey } from "./config-util";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { TextlintStaticOptionDescriptor } from "./TextlintConfigDescriptor";
import { loadPreset } from "./preset-loader";

export const parsePlugins = ({
    pluginsObject
}: {
    pluginsObject: NonNullable<TextlintRcConfig["plugins"]>;
    parentPresetName?: string;
}): {
    plugins: TextlintStaticOptionDescriptor["plugins"];
} => {
    const plugins: TextlintStaticOptionDescriptor["plugins"] = [];
    if (Array.isArray(pluginsObject)) {
        // { plugins: ["a", "b"] }
        pluginsObject.forEach((pluginId) => {
            plugins.push({
                pluginId: pluginId
            });
        });
    } else {
        // { plugins: { "a": true, "b": options } }
        Object.entries(pluginsObject).forEach(([pluginId, pluginOptions]) => {
            plugins.push({
                pluginId: pluginId,
                options: pluginOptions
            });
        });
    }
    return {
        plugins
    };
};
export const parseFilterRules = ({
    rulesObject
}: {
    rulesObject: NonNullable<TextlintRcConfig["filters"]>;
}): {
    filterRules: TextlintStaticOptionDescriptor["filterRules"];
} => {
    // rules
    const rules: TextlintStaticOptionDescriptor["filterRules"] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        // rule
        rules.push({
            ruleId: ruleId,
            options: ruleOptions
        });
    });
    return {
        filterRules: rules
    };
};
export const parseRules = ({
    rulesObject,
    moduleResolver
}: {
    rulesObject: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
}): {
    rules: TextlintStaticOptionDescriptor["rules"];
} => {
    // rules
    const rules: TextlintStaticOptionDescriptor["rules"] = [];
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
        if (isPresetRuleKey(ruleId)) {
            // load preset
            // expand as rules
            const presetRules = loadPreset({
                presetName: ruleId,
                userDefinedRuleOptions: ruleOptions,
                moduleResolver: moduleResolver
            });
            presetRules.forEach((rule) => {
                rules.push({
                    ruleId: rule.ruleId,
                    options: rule.options
                });
            });
        } else {
            // rule
            rules.push({
                ruleId: ruleId,
                options: ruleOptions
            });
        }
    });
    return {
        rules
    };
};
