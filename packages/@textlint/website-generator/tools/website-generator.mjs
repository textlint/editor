import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textcheckerElementDir = path.join(__dirname, "../../../textchecker-element");
const outputDir = path.join(__dirname, "../template");
const createHTMLTemplate = () => {
    const html = fs.readFileSync(path.join(textcheckerElementDir, "./index.html"), "utf-8");
    return html
        .replace(/<title>[^]+<\/title>/, "<title>{{title}}</title>")
        .replace(`"./index.ts"`, `"./textchecker-element.esm.js"`)
        .replace(
            /<textarea id="input"([^>]*?)>[^<]*?<\/textarea>/m,
            `<textarea id="input"$1>{{placeholder}}</textarea>`
        );
};
try {
    // Write index.html
    fs.writeFileSync(path.join(outputDir, "index.html"), createHTMLTemplate(), "utf-8");
    // Copy public-dist/textchecker-element.esm.js to template/
    fs.copyFileSync(
        path.join(textcheckerElementDir, "./public-dist/textchecker-element.esm.js"),
        path.join(outputDir, "textchecker-element.esm.js")
    );
} catch (error) {
    console.error(error);
    process.exit(1);
}
