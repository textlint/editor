import * as fs from "fs";
import path from "path";
import webpack from "webpack";
import type { TextlintScriptMetadata } from "@textlint/script-parser";
// @ts-ignore
import rimraf from "rimraf";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
// @ts-ignore
import TerserPlugin from "terser-webpack-plugin";
import { generateCode, loadTextlintrc } from "./CodeGenerator/worker-codegen";
import { CodeGeneraterOptions } from "./CodeGenerator/CodeGeneraterOptions";

export function validateTextlintScriptMetadata(metadata: {}): asserts metadata is Omit<
    TextlintScriptMetadata,
    "config"
> {
    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined) {
            throw new Error(
                `metadata.${key} is undefined. please set ${key} metadata in package.json or --metadata${
                    key[0].toUpperCase() + key.slice(1)
                } CLI flag`
            );
        }
    });
}

interface WebpackConfig {
    inputFilePath: string;
    outputDir: string;
    mode: "production" | "development";
    metadata: TextlintScriptMetadata;
}

export const createWebpackConfig = ({
    inputFilePath,
    outputDir,
    mode,
    metadata
}: WebpackConfig): webpack.Configuration => {
    const experimentalInlining = Boolean(process.env.TEXLINT_COMPILER_INLINING);
    // inline fs.readFile
    // babel-scripts did it
    const fsInliningRule = {
        test: /\.m?js$/,
        include: /textlint-rule-/,
        use: {
            loader: "babel-loader",
            options: {
                plugins: [
                    [
                        "babel-plugin-static-fs",
                        {
                            target: "browser",
                            dynamic: true,
                            onFile: function onFile(file: string) {
                                console.log("[@textlint/script-compiler] Discovered new fs.read:", file);
                            }
                        }
                    ]
                ]
            }
        }
    };
    return {
        mode: mode,
        devtool: false,
        entry: {
            "textlint-worker": inputFilePath
        },
        output: {
            library: "textlint",
            libraryTarget: "self",
            path: outputDir
        },
        plugins: [
            // https://github.com/azu/kuromojin injection
            // 1.x 2.x supports
            new webpack.DefinePlugin({
                "process.env.KUROMOJIN_DIC_PATH": JSON.stringify("https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict"),
                "process.env.TEXTLINT_SCRIPT_METADATA": JSON.stringify(metadata)
            }),
            // kuromoji patch
            new webpack.NormalModuleReplacementPlugin(
                /kuromoji\/src\/loader\/BrowserDictionaryLoader\.js/,
                path.join(__dirname, "../patch/kuromoji.js")
            ),
            new webpack.BannerPlugin({
                banner: `textlinteditor: ${JSON.stringify(metadata)}`
            }),
            // Node.js polyfill
            new NodePolyfillPlugin({})
        ],
        module: {
            rules: experimentalInlining ? [fsInliningRule] : []
        },
        optimization: {
            minimize: true,
            minimizer: [
                // Preserve licence and banner comment
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: /^\**!|@preserve|@license|@cc_on/i
                        }
                    },
                    extractComments: false
                })
            ]
        },
        resolve: {
            fallback: {
                fs: false
            }
        },
        performance: {
            hints: false
        }
    };
};
export type compileOptions = {
    // compiler
    compileTarget: "webworker";
    outputDir: string;
    mode: "production" | "development";
    metadata: Omit<TextlintScriptMetadata, "config">;
} & CodeGeneraterOptions;
export const compile = async (options: compileOptions) => {
    const cwd = options.cwd || process.cwd();
    const configResult = await loadTextlintrc({
        cwd,
        configFilePath: options.configFilePath
    });
    if (configResult.ok === false) {
        console.error(configResult.error.message, configResult.error.errors);
        throw new Error(configResult.error.message);
    }
    const code = await (async () => {
        if (options.compileTarget === "webworker") {
            return generateCode(configResult.config);
        }
        throw new Error(`Unknown compileTarget: ${options.compileTarget}`);
    })();
    const tempDir = path.join(cwd, "__textlint_compier_temp");
    await fs.promises.mkdir(tempDir, {
        recursive: true
    });
    const inputFilePath = path.join(tempDir, "input.js");
    await fs.promises.writeFile(inputFilePath, code, "utf-8");
    const outputFilePath = options.outputDir;
    return new Promise<void>((resolve, reject) => {
        const config = createWebpackConfig({
            inputFilePath: inputFilePath,
            outputDir: outputFilePath,
            mode: options.mode,
            metadata: {
                ...options.metadata,
                config: configResult.rawConfig
            }
        });
        webpack([config], (error: undefined | (Error & { details?: string }), stats?) => {
            if (error) {
                console.error(error.stack || error);
                if (error.details) {
                    console.error(error.details);
                }
                return reject(error);
            }

            const info = stats?.toJson();
            if (stats?.hasErrors()) {
                console.error(info?.errors);
                return reject(info?.errors);
            }
            if (stats?.hasWarnings()) {
                console.warn(info?.warnings);
            }
            resolve();
        });
    }).finally(() => {
        return rimraf.sync(tempDir);
    });
};
