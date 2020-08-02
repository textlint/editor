import type { TextlintFixResult, TextlintMessage, TextlintResult } from "@textlint/types";

/**
 * textlint Server API
 */
export type API = {
    lint({ text, ext }: { text: string; ext: string }): TextlintResult[];
    // fix all text with all rule
    fixAll({ text, ext }: { text: string; ext: string }): TextlintFixResult;
    // fix all with with a rule
    fixRule({ text, ext, message }: { text: string; ext: string; message: TextlintMessage }): TextlintFixResult;
    // fix the text
    fixText({ text, ext, message }: { text: string; ext: string; message: TextlintMessage }): { output: string };
};
