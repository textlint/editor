import meow from "meow";
import { compile, validateTextlintScriptMetadata } from "./compiler";
import path from "path";
import readPkg from "read-pkg";

export const cli = meow(
    `
    Usage
      $ textlint-script-compiler 
 
    Options
      --cwd                       [path:String] current working directory
      --textlintrc                [path:String] path to .textlintrc file.
                                  Default: .textlintrc.{json,yaml,js}
      --output-dir                [path:String] output file path that is written of reported result.
      --mode                      [String] build mode: "production" or "development"
      
    Metadata Options

      Metadata is inferred from package.json by default.
      If you want to set metadata by manually, please use these flags.
    
      --metadataName              [String] generated script name
      --metadataNamespace         [String] generated script namespace
      --metadataHomepage          [String] generated script homepage url
      --metadataVersion           [String] generated script version
 
    Examples
      $ textlint-script-compiler --output-dir ./dist --metadataName "test" --metadataNamespace "https://example.com"
`,
    {
        flags: {
            outputDir: {
                type: "string",
                isRequired: true
            },
            textlintrc: {
                type: "string"
            },
            compileTarget: {
                type: "string",
                default: "webworker"
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
        name: pkg.name ?? flags["metadataName"],
        namespace: pkg.homepage ?? flags["metadataNamespace"],
        homepage: pkg.homepage ?? flags["metadataHomepage"],
        version: pkg.version ?? flags["metadataVersion"]
    };
    // assert
    validateTextlintScriptMetadata(metadata);
    return compile({
        configFilePath: flags.textlintrc,
        cwd: flags.cwd,
        compileTarget: flags.compileTarget as "webworker",
        outputDir: path.join(flags.cwd, flags.outputDir),
        mode: flags.mode as "production" | "development",
        metadata: metadata
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
