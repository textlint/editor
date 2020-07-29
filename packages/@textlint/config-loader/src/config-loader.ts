import { rcFile } from "rc-config-loader";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { loadFilterRules, loadPlugins, loadRules } from "./loader";
import { TextlintRcConfig } from "./TextlintRcConfig";
import type { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";

export type TextlintConfigLoaderOptions = {
    cwd?: string;
    configFilePath?: string;
    // For debugging
    /**
     * node_modules directory path
     * Default: undefined
     */
    node_moduleDir?: string;
    // pre process
    preLoadingPackage?: (
        packages: TextlintLoadPackagesFromRawConfigOptions
    ) => TextlintLoadPackagesFromRawConfigOptions;
    /**
     * This definitions replace id to rule module
     * It is useful for replacing specific ruleId with specific rule module.
     * Main use-case is tester.
     */
    testReplaceDefinitions?: {
        rule?: TextlintConfigDescriptor["rules"];
        filterRules?: TextlintConfigDescriptor["filterRules"];
        plugins?: TextlintConfigDescriptor["plugins"];
    };
};
export type TextlintLintConfigLoaderResult =
    | {
          ok: true;
          config: TextlintConfigDescriptor; // Core Option object
          configFilePath: string;
      }
    | {
          // load config error
          ok: false;
          configFilePath?: string;
          rawConfig?: TextlintRcConfig;
          error: {
              message: string;
              errors: Error[];
          };
      };

export type TextlintConfigLoaderRawResult =
    | {
          ok: true;
          configFilePath: string;
          rawConfig: TextlintRcConfig;
      }
    | {
          ok: false;
          error: {
              message: string;
              errors: Error[];
          };
      };
export type TextlintLoadPackagesFromRawConfigOptions = {
    /**
     * Loaded config object
     */
    rawConfig: TextlintRcConfig;
    /**
     * node_modules directory path
     * Default: undefined
     */
    node_moduleDir?: string;
    /**
     * This definitions replace id to rule module
     * It is useful for replacing specific ruleId with specific rule module.
     * Main use-case is tester.
     */
    testReplaceDefinitions?: {
        rule?: TextlintConfigDescriptor["rules"];
        filterRules?: TextlintConfigDescriptor["filterRules"];
        plugins?: TextlintConfigDescriptor["plugins"];
    };
};
export type TextlintLoadPackagesFromRawConfigResult =
    | {
          ok: true;
          config: TextlintConfigDescriptor; // Core Option object
      }
    | {
          // load config error
          ok: false;
          error: {
              message: string;
              errors: Error[];
          };
      };

/**
 * Load packages in RawConfig and return loaded config object
 * @param options
 */
export const loadPackagesFromRawConfig = (
    options: TextlintLoadPackagesFromRawConfigOptions
): TextlintLoadPackagesFromRawConfigResult => {
    // TODO: validation
    // Search textlint's module
    const moduleResolver = new TextLintModuleResolver({
        rulesBaseDirectory: options.node_moduleDir
    });
    // rules
    const { rules, presets, rulesError } = loadRules({
        rulesObject: options.rawConfig.rules ?? {},
        moduleResolver,
        testReplaceDefinitions: options.testReplaceDefinitions?.rule
    });
    // filterRules
    const { filterRules, filterRulesError } = loadFilterRules({
        rulesObject: options.rawConfig.filters ?? {},
        moduleResolver,
        testReplaceDefinitions: options.testReplaceDefinitions?.filterRules
    });
    // plugins
    const { plugins, pluginsError } = loadPlugins({
        pluginsObject: options.rawConfig.plugins ?? {},
        moduleResolver,
        testReplaceDefinitions: options.testReplaceDefinitions?.plugins
    });
    if (rulesError) {
        return {
            ok: false,
            error: rulesError
        };
    }
    if (filterRulesError) {
        return {
            ok: false,
            error: filterRulesError
        };
    }
    if (pluginsError) {
        return {
            ok: false,
            error: pluginsError
        };
    }
    const loadedConfig: TextlintConfigDescriptor = {
        rules,
        presets,
        plugins,
        filterRules
    };
    // TODO: after validation
    return {
        ok: true,
        config: loadedConfig
    };
};
/**
 *  Load config file and return config object that is loaded rule instance.
 * @param options
 */
export const loadConfig = (options: TextlintConfigLoaderOptions): TextlintLintConfigLoaderResult => {
    const rawResult = loadRawConfig(options);
    if (!rawResult.ok) {
        return {
            ok: false,
            error: rawResult.error
        };
    }
    const packageOptions = {
        rawConfig: rawResult.rawConfig,
        node_moduleDir: options.node_moduleDir,
        testReplaceDefinitions: options.testReplaceDefinitions
    };
    const result = loadPackagesFromRawConfig(
        options.preLoadingPackage ? options.preLoadingPackage(packageOptions) : packageOptions
    );
    if (!result.ok) {
        return {
            ok: false,
            configFilePath: rawResult.configFilePath,
            error: result.error
        };
    }
    return {
        ok: true,
        config: result.config,
        configFilePath: rawResult.configFilePath
    };
};
/**
 *  Load config file and return config object that is not loaded rule instance
 *  It is just JSON present for config file. Raw data
 * @param options
 */
export const loadRawConfig = (options: TextlintConfigLoaderOptions): TextlintConfigLoaderRawResult => {
    try {
        const results = rcFile<TextlintRcConfig>("textlint", {
            cwd: options.cwd,
            configFileName: options.configFilePath,
            packageJSON: {
                fieldName: "textlint"
            }
        });
        // Not Found
        if (!results) {
            return {
                ok: false,
                error: {
                    message: "textlint config is not found",
                    errors: [
                        new Error(`textlint config is not found
                
textlint require .textlintrc config file.
The config file define the use of rules.`)
                    ]
                }
            };
        }
        return {
            ok: true,
            rawConfig: results.config,
            configFilePath: results.filePath
        };
    } catch (error) {
        return {
            ok: false,
            error: {
                message: "textlint config is not found",
                errors: [error]
            }
        };
    }
};
