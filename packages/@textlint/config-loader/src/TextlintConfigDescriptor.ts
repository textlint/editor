// Probably same with TextlintKernelOptions
import { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "@textlint/kernel";
import { TextlintRuleModule, TextlintRuleOptions } from "@textlint/types";

export type TextlintConfigPlugin = TextlintKernelPlugin & { filePath: string; moduleName: string };
export type TextlintConfigRule = TextlintKernelRule & { filePath: string; moduleName: string };
export type TextlintConfigFilterRule = TextlintKernelFilterRule & { filePath: string; moduleName: string };
export type TextlintConfigRulePreset = {
    id: string;
    preset: {
        rules: {
            [index: string]: TextlintRuleModule
        },
        rulesConfig: {
            [index: string]: TextlintRuleOptions | boolean
        }
    },
    filePath: string;
    moduleName: string;
};
export type TextlintConfigDescriptor = {
    // plugins
    plugins: TextlintConfigPlugin[];
    // rules
    rules: TextlintConfigRule[];
    // presets
    // TODO: preset type is not defined in textlint
    presets: TextlintConfigRulePreset[];
    // filterRules
    filterRules: TextlintConfigFilterRule[];
};
