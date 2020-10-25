import { TextlintRcConfig } from "@textlint/config-loader";
import { TextlintStaticOptionDescriptor } from "./TextlintConfigDescriptor";
import { parseFilterRules, parsePlugins, parseRules } from "./parser";

/**
 * Parse textlintrc and return parsed config
 * Note: the pserse function does not load any module
 * In other words, the result does not includes presets.rulesConfig
 */
export const parseOptionsFromConfig = (rawConfig: TextlintRcConfig): TextlintStaticOptionDescriptor => {
    // rules
    const { rules } = parseRules({
        rulesObject: rawConfig.rules ?? {}
    });
    // filterRules
    const { filterRules } = parseFilterRules({
        rulesObject: rawConfig.filters ?? {}
    });
    // plugins
    const { plugins } = parsePlugins({
        pluginsObject: rawConfig.plugins ?? {}
    });
    return {
        rules,
        plugins,
        filterRules
    };
};
