import fs from "fs";
import path from "path";
import { compile, compileOptions } from "@textlint/script-compiler";

export type generateWebSiteOptions = compileOptions & {
    title: string;
    placeholder: string;
};
export const generateWebSite = async (options: generateWebSiteOptions) => {
    const templateDir = path.join(__dirname, "../template");
    // textlint-worker.js
    await compile({
        mode: "production",
        compileTarget: "webworker",
        outputDir: options.outputDir,
        configFilePath: options.configFilePath,
        cwd: options.cwd,
        metadata: options.metadata
    });
    // copy template/textchecker-element.esm.js
    fs.copyFileSync(
        path.join(templateDir, "textchecker-element.esm.js"),
        path.join(options.outputDir, "textchecker-element.esm.js")
    );

    // index.{js,html}
    const indexHtml = fs.readFileSync(path.join(templateDir, "index.html"), "utf-8");
    const filledHTML = indexHtml.replace("{{title}}", options.title).replace("{{placeholder}}", options.placeholder);
    fs.writeFileSync(path.join(options.outputDir, "index.html"), filledHTML, "utf-8");
};
