import fs from "fs/promises";
import untildify from "untildify";
import { TextlintRuleOptions } from "@textlint/types";
import path from "path";

const inlineRuleFiles = (filePaths: string[], baseDir: string): Promise<string[]> => {
    return Promise.all(
        filePaths.map((filePath) => {
            return fs.readFile(path.resolve(baseDir, untildify(filePath)), "utf-8");
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
export const prh = async ({
    configFilePath,
    options
}: {
    configFilePath: string;
    options: TextlintRuleOptions | undefined | boolean;
}): Promise<PrhOptions | undefined | boolean> => {
    if (typeof options === "boolean" || options === undefined) {
        return options;
    }
    const baseDir = path.dirname(configFilePath);
    return {
        ...options,
        rulePaths: [],
        ruleContents: await inlineRuleFiles(options.rulePaths, baseDir)
    };
};
