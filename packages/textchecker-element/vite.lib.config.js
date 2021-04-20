const path = require("path");

module.exports = {
    publicDir: "___", // no copy public
    build: {
        outDir: "public-dist",
        lib: {
            name: "textchecker-element-website",
            entry: path.resolve(__dirname, "./index.ts")
        }
    }
};
