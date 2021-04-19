import meow from "meow";
import path from "path";
import { generateWebSite } from "./website-generator";
import readPkg from "read-pkg";
import { validateTextlintScriptMetadata } from "@textlint/script-compiler";

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

    Metadata Options

      Metadata is inferred from package.json by default.
      If you want to set metadata by manually, please use theme flags.
    
      --metadataName              [String] generated script name
      --metadataNamespace         [String] generated script namespace
      --metadataHomepage          [String] generated script homepage url
      --metadataVersion           [String] generated script version
 
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
                type: "string"
            },
            metadataNamespace: {
                type: "string"
            },
            metadataHomepage: {
                type: "string"
            },
            metadataVersion: {
                type: "string"
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
    const metadata = {
        name: flags["metadataName"] ?? pkg.name,
        namespace: flags["metadataNamespace"] ?? pkg.homepage,
        homepage: flags["metadataHomepage"] ?? pkg.homepage,
        version: flags["metadataVersion"] ?? pkg.version
    };
    // assert
    validateTextlintScriptMetadata(metadata);
    return generateWebSite({
        title: flags.title ?? (pkg.name as string),
        placeholder: flags.placeholder ?? "",
        configFilePath: flags.textlintrc,
        cwd: flags.cwd,
        compileTarget: "webworker",
        outputDir: path.join(flags.cwd, flags.outputDir),
        mode: (flags.mode as "production" | "development") ?? "production",
        metadata
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
