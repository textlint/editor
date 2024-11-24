const path = require("path");
const webpack = require("webpack");
const GlobEntriesPlugin = require("webpack-watched-glob-entries-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
    webpack: (config, { dev, vendor }) => {
        // Add typescript loader. supports .ts and .tsx files as entry points
        config.resolve.extensions.push(".ts");
        config.resolve.extensions.push(".tsx");
        config.resolve.fallback = { path: require.resolve("path-browserify") };
        config.entry = GlobEntriesPlugin.getEntries([
            path.resolve("app", "*.{js,mjs,jsx,ts,tsx}"),
            path.resolve("app", "?(scripts)/*.{js,mjs,jsx,ts,tsx}")
        ]);
        config.module.rules.push({
            test: /\.tsx?$/,
            loader: "ts-loader"
        });
        config.module.rules.push({
            test: /\.css$/i,
            use: ["style-loader", "css-loader"]
        });
        config.plugins.unshift(
            // new CopyWebpackPlugin({
            //     patterns: [
            //         {
            //             from: "download/",
            //             to: path.join(config.output.path, "download")
            //         }
            //     ]
            // }),
            new webpack.DefinePlugin({
                "process.env.RANDOM_KEY": JSON.stringify(
                    Math.random()
                        .toString(36)
                        .replace(/[^a-z]+/g, "")
                        .substr(0, 32)
                )
            })
        );
        // Important: return the modified config
        return config;
    },
    copyIgnore: ["**/*.js", "**/*.json", "**/*.ts", "**/*.tsx"]
};
