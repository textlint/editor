import type { TextlintConfigDescriptor } from "@textlint/config-loader";
import { prh } from "./rules/prh";

export const inlineConfig = async (config: TextlintConfigDescriptor): Promise<TextlintConfigDescriptor> => {
    return {
        ...config,
        rules: await Promise.all(
            config.rules.map(async (rule) => {
                if (rule.ruleId === "prh") {
                    return {
                        ...rule,
                        options: await prh(rule.options)
                    };
                }
                return rule;
            })
        )
    };
};
