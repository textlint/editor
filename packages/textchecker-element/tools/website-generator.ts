import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

const outputDir = path.join(__dirname, "../../@textlint/website-generator/template");
const createHTMLTemplate = () => {
    const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf-8");
    return html
        .replace("<title>.*</title>", "<title>{{title}}</title>")
        .replace(
            `"/public/index.ts"`,
            `"https://cdn.skypack.dev/textchecker-element/public-dist/textchecker-element.es.js"`
        )
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
        html: createHTMLTemplate()
    };
    fs.writeFileSync(path.join(outputDir, "index.html"), index.html, "utf-8");
})().catch((error) => {
    console.error(error.message);
    console.error(String(error.output));
    process.exit(1);
});
