import fs from "fs/promises";
import untildify from "untildify";
import { TextlintRuleOptions } from "@textlint/types";

const inlineRuleFiles = (filePaths: string[]): Promise<string[]> => {
    return Promise.all(
        filePaths.map((filePath) => {
            return fs.readFile(untildify(filePath), "utf-8");
        })
    );
};
type PrhOptions =
    | { rulePaths: string[] }
    | ({
          ruleContents: string[];
      } & TextlintRuleOptions);
/**
 * use `ruleContents` instead of `rulePaths` for inlining
 * https://github.com/textlint-rule/textlint-rule-prh
 */
export const prh = async (
    options: TextlintRuleOptions | undefined | boolean
): Promise<PrhOptions | undefined | boolean> => {
    if (typeof options === "boolean" || options === undefined) {
        return options;
    }
    return {
        ...options,
        rulePaths: [],
        ruleContents: await inlineRuleFiles(options.rulePaths)
    };
};
