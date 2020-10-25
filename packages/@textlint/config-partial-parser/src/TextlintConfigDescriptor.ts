import type { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "@textlint/kernel";

/**
 * Parsable static config data
 */
export type TextlintStaticOptionPlugin = Pick<TextlintKernelPlugin, "pluginId" | "options">;
export type TextlintStaticOptionRule = Pick<TextlintKernelRule, "ruleId" | "options">;
export type TextlintStaticOptionFilterRule = Pick<TextlintKernelFilterRule, "ruleId" | "options">;
export type TextlintStaticOptionDescriptor = {
    // plugins
    plugins: TextlintStaticOptionPlugin[];
    // rules -includes  expands presets
    rules: TextlintStaticOptionRule[];
    // filterRules
    filterRules: TextlintStaticOptionFilterRule[];
};
