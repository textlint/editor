import webpack from "webpack";
import { generateCode, loadTextlintrc } from "./CodeGenerator/worker-codegen";
import { CodeGeneraterOptions } from "./CodeGenerator/CodeGeneraterOptions";
import * as fs from "fs";
import path from "path";
// @ts-ignore
import rimraf from "rimraf";

interface WebpackConfig {
    inputFilePath: string;
    outputDir: string;
    mode: "production" | "development";
    metadata: object;
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
            textlint: inputFilePath
        },
        output: {
            library: "textlint",
            libraryTarget: "self" as any, // umd
            path: outputDir
        },
        plugins: [
            // https://github.com/azu/kuromojin injection
            // 1.x 2.x supports
            new webpack.DefinePlugin({
                "process.env.KUROMOJIN_DIC_PATH": JSON.stringify("https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict")
            }),
            // kuromoji patch
            new webpack.NormalModuleReplacementPlugin(
                /kuromoji\/src\/loader\/BrowserDictionaryLoader\.js/,
                path.join(__dirname, "../patch/kuromoji.js")
            ),
            new webpack.BannerPlugin({
                banner: `textlinteditor: ${JSON.stringify(metadata)}`
            })
        ],
        module: {
            rules: experimentalInlining ? [fsInliningRule] : []
        },
        node: {
            fs: "empty"
        }
    };
};
export type compileOptions = {
    // compiler
    compileTarget: "webworker";
    outputDir: string;
    mode: "production" | "development";
    metadata: {
        name: string;
        namespace: string;
    };
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
    return new Promise((resolve, reject) => {
        const config = createWebpackConfig({
            inputFilePath: inputFilePath,
            outputDir: outputFilePath,
            mode: options.mode,
            metadata: {
                name: options.metadata.name,
                namespace: options.metadata.namespace,
                config: configResult.rawConfig
            }
        });
        webpack([config], (error: Error & { details?: string }, stats) => {
            if (error) {
                console.error(error.stack || error);
                if (error.details) {
                    console.error(error.details);
                }
                return reject(error);
            }

            const info = stats.toJson();
            if (stats.hasErrors()) {
                console.error(info.errors.join("\n"));
                return reject(new Error(info.errors.join("\n")));
            }
            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }
            resolve();
        });
    }).finally(() => {
        return rimraf.sync(tempDir);
    });
};