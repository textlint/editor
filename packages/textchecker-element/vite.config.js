const path = require("path");

module.exports = {
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    base: "./",
    build: {
        outDir: path.resolve(__dirname, "dist"),
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html")
            }
        }
    }
};
