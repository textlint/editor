import meow from "meow";
import { compile } from "./compiler";
import path from "path";

export const cli = meow(
    `
    Usage
      $ textlint-compiler 
 
    Options
      --cwd              current working directory
      --textlintrc       [path:String] path to .textlintrc file. Default: load .textlintrc.{json,yaml,js}
      --output-dir       [path:String] output file path that is written of reported result.
 
    Examples
      $ textlint-compiler --output-dir ./dist
`,
    {
        flags: {
            outputDir: {
                type: "string",
                isRequired: true
            },
            textlintrc: {
                type: "string",
            },
            compileTarget: {
                type: "string",
                default: "webworker"
            },
            mode: {
                type: "string",
                default: "production"
            },
            // DEBUG option
            cwd: {
                type: "string",
                default: process.cwd()
            },
            debug: {
                type: "boolean",
                default: false
            }
        },
        autoHelp: true,
        autoVersion: true
    }
);

export const run = (
    _input = cli.input,
    flags = cli.flags
): Promise<{ exitStatus: number; stdout: string | null; stderr: Error | null }> => {
    return compile({
        configFilePath: flags.textlintrc,
        cwd: flags.cwd,
        compileTarget: flags.compileTarget as "webworker",
        outputDir: path.join(flags.cwd, flags.outputDir),
        mode: flags.mode as "production" | "development"
    }).then(() => {
        return {
            exitStatus: 0,
            stdout: null,
            stderr: null
        }
    }).catch((error) => {
        return {
            exitStatus: 1,
            stderr: null,
            stdout: error
        }
    })
};
