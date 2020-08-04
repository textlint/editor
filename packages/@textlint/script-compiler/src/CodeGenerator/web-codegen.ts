import { loadConfig } from "@textlint/config-loader";

(async function () {
    const configResult = await loadConfig({
        cwd: process.cwd(),
        preLoadingPackage: (packageOptions) => {
            // TODO: default plugin handling?
            packageOptions.rawConfig.plugins = Array.isArray(packageOptions.rawConfig?.plugins)
                ? ["@textlint/text", "@textlint/markdown"].concat(packageOptions.rawConfig?.plugins ?? [])
                : {
                      "@textlint/text": true,
                      "@textlint/markdown": true,
                      ...packageOptions.rawConfig?.plugins
                  };
            return packageOptions;
        }
    });
    if (!configResult.ok) {
        console.error(configResult.error.message, configResult.error.errors);
        return;
    }
    const { config } = configResult;
    const stringify = (item: any[]): string => {
        // unwrap code
        return JSON.stringify(item, null, 4).replace(/"(moduleInterop\(require\('.*?'\)\))"/g, "$1");
    };

    const code = `// Generated code by textlint-script-compiler
import { TextlintKernel } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
const kernel = new TextlintKernel();
const rules = ${stringify(
        config.rules.map((rule) => {
            return {
                ruleId: rule.ruleId,
                rule: `moduleInterop(require('${rule.moduleName}'))`,
                options: rule.options
            };
        })
    )};
const filterRules = ${stringify(
        config.filterRules.map((rule) => {
            return {
                ruleId: rule.ruleId,
                rule: `moduleInterop(require('${rule.moduleName}'))`,
                options: rule.options
            };
        })
    )};
const plugins = ${stringify(
        config.plugins.map((plugin) => {
            return {
                pluginId: plugin.pluginId,
                plugin: `moduleInterop(require('${plugin.moduleName}'))`,
                options: plugin.options
            };
        })
    )};
export const lintText = (text, ext) => {
    return kernel.lintText(text, {
        rules: rules,
        filterRules: filterRules,
        plugins: plugins,
        filePath: "/path/to/README" + ext,
        ext: ext,
    });
};
`;
    console.log(code);
})();
