import fs from "fs";
import path from "path";
import { compile, compileOptions } from "@textlint/compiler";

export type generateWebSiteOptions = compileOptions & {
    title: string;
    placeholder: string;
};
export const generateWebSite = async (options: generateWebSiteOptions) => {
    const templateDir = path.join(__dirname, "../template");
    // textlint.js
    await compile({
        mode: "production",
        compileTarget: "webworker",
        outputDir: options.outputDir,
        configFilePath: options.configFilePath,
        cwd: options.cwd
    });
    // index.{js,html}
    fs.copyFileSync(path.join(templateDir, "index.js"), path.join(options.outputDir, "index.js"));
    const indexHtml = fs.readFileSync(path.join(templateDir, "index.html"), "utf-8");
    const filledHTML = indexHtml.replace("{{title}}", options.title).replace("{{placeholder}}", options.placeholder);
    fs.writeFileSync(path.join(options.outputDir, "index.html"), filledHTML, "utf-8");
};
