import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

const inputDir = path.join(__dirname, "../temp");
const outputDir = path.join(__dirname, "../../@textlint/website-generator/template");
const createIndexJS = () => {
    const js = fs.readFileSync(path.join(inputDir, "public/index.js"), "utf-8");
    return js.replace(`"../src/index"`, `"https://cdn.skypack.dev/textchecker-element"`);
};
const createHTMLTemplate = () => {
    const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf-8");
    return html
        .replace("<title>.*</title>", "<title>{{title}}</title>")
        .replace(`<script src="./index.ts"></script>`, `<script type="module" src="./index.js"></script>`)
        .replace(
            /<textarea class="textarea">[\s\S]+<\/textarea>/m,
            `<textarea class="textarea">{{placeholder}}</textarea>`
        );
};
(async function () {
    // compile public code
    execFileSync("tsc", ["--project", "./tsconfig.website-generator.json"], {
        cwd: path.join(__dirname, "..")
    });

    const index = {
        js: createIndexJS(),
        html: createHTMLTemplate()
    };

    fs.writeFileSync(path.join(outputDir, "index.html"), index.html, "utf-8");
    fs.writeFileSync(path.join(outputDir, "index.js"), index.js, "utf-8");
})().catch((error) => {
    console.error(error.message);
    console.error(String(error.output));
    process.exit(1);
});
