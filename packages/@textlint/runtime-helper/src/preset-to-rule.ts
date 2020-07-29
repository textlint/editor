// Preset to kernel rule
import type { TextlintConfigRulePreset } from "@textlint/config-loader";
import type { TextlintKernelRule } from "@textlint/kernel";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";

export const presetToKernelRules = (
    preset: TextlintConfigRulePreset["preset"],
    presetId: TextlintConfigRulePreset["id"]
): TextlintKernelRule[] => {
    const presetRules = preset.rules;
    return Object.keys(presetRules).map((ruleId) => {
        const normalizedKey = normalizeTextlintPresetSubRuleKey({ preset: presetId, rule: ruleId });
        return {
            ruleId: normalizedKey,
            rule: preset.rules[ruleId],
            options: preset.rulesConfig[ruleId]
        };
    });
};
