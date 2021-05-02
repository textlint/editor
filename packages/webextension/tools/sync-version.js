const fs = require("fs/promises");
const path = require("path");
const lerna = require("../../../lerna.json");
(async function main() {
    const manifestFilePath = path.resolve(__dirname, "../app/manifest.json");
    const manifest = JSON.parse(await fs.readFile(manifestFilePath, "utf-8"));
    manifest["version"] = lerna["version"];
    await fs.writeFile(manifestFilePath, JSON.stringify(manifest, null, 4) + "\n", "utf-8");
})();
