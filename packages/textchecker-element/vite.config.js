const path = require("path");

module.exports = {
    build: {
        outDir: "public-dist",
        lib: {
            name: "textchecker-element-website",
            entry: path.resolve(__dirname, "public/index.ts")
        }
    }
};
