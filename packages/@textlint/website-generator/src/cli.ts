import meow from "meow";
import path from "path";
import { generateWebSite } from "./website-generator";
import readPkg from "read-pkg";

export const cli = meow(
    `
    Usage
      $ textlint-website-generator 
 
    Options
      --title                     [String] Website page title
      --placeholder               [String] Placeholder text in generated website
      --cwd                       current working directory
      --textlintrc                [path:String] path to .textlintrc file. Default: load .textlintrc.{json,yaml,js}
      --output-dir                [path:String] output file path that is written of reported result.
      --metadataName             [String] generated script name
      --metadataNamespace        [String] generated script namespace
 
    Examples
      $ textlint-website-generator --output-dir ./dist --metadataName "script name" --metadataNamespace "https://example.com"
      $ textlint-website-generator --output-dir ./dist --metadataName "script name" --metadataNamespace "https://example.com" --title "rule tester" --placeholder "default text" 
`,
    {
        flags: {
            title: {
                type: "string"
            },
            placeholder: {
                type: "string"
            },
            outputDir: {
                type: "string",
                isRequired: true
            },
            textlintrc: {
                type: "string"
            },
            mode: {
                type: "string",
                default: "production"
            },
            metadataName: {
                type: "string",
                isRequired: true
            },
            metadataNamespace: {
                type: "string",
                isRequired: true
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

export const run = async (
    _input = cli.input,
    flags = cli.flags
): Promise<{ exitStatus: number; stdout: string | null; stderr: Error | null }> => {
    const pkg = await readPkg({
        cwd: flags.cwd
    });
    return generateWebSite({
        title: flags.title ?? (pkg.name as string),
        placeholder: flags.placeholder ?? "",
        configFilePath: flags.textlintrc,
        cwd: flags.cwd,
        compileTarget: "webworker",
        outputDir: path.join(flags.cwd, flags.outputDir),
        mode: (flags.mode as "production" | "development") ?? "production",
        metadata: {
            name: flags["metadataName"],
            namespace: flags["metadataNamespace"]
        }
    })
        .then(() => {
            return {
                exitStatus: 0,
                stdout: null,
                stderr: null
            };
        })
        .catch((error) => {
            return {
                exitStatus: 1,
                stderr: null,
                stdout: error
            };
        });
};
