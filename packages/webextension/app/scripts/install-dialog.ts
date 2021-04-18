import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";
import { browser } from "webextension-polyfill-ts";
import { parseMetadata, TextlintScriptMetadata } from "@textlint/script-parser";
import { logger } from "./utils/logger";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));

async function installHandler({
    script,
    scriptURL,
    metadata
}: {
    script: string;
    scriptURL: string;
    metadata: TextlintScriptMetadata;
}) {
    try {
        // Save to DB
        await port.addScript({
            name: metadata.name,
            namespace: metadata.namespace,
            homepage: metadata.homepage,
            version: metadata.version,
            scriptUrl: scriptURL,
            code: script,
            ext: ".md",
            matchPattern: "**/*",
            textlintrc: JSON.stringify(metadata.config, null, 4)
        });
    } catch (error) {
        logger.error("[InstallDialog]", error);
    }
}

export function escapeHTML(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

(async function main() {
    const installButton = document.querySelector("#js-install-button") as HTMLButtonElement;
    installButton.disabled = true;

    const url = new URL(location.href);
    const script = url.searchParams.get("script");
    if (!script) {
        throw new Error(`script is not found: ${location.href}`);
    }
    const scriptURL = decodeURIComponent(script);
    const content = await fetch(scriptURL).then((res) => res.text());
    const metadata = parseMetadata(content);
    installButton.addEventListener("click", async () => {
        installButton.disabled = true;
        installButton.textContent = "Installing";
        await installHandler({ script: content, scriptURL: scriptURL, metadata: metadata });
        installButton.textContent = "Installed";
    });
    // metadata
    const metadataDiv = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = "Script metadata";
    const metadataPre = document.createElement("pre");
    metadataPre.textContent = JSON.stringify(metadata, null, 4);
    metadataDiv.append(title);
    metadataDiv.append(metadataPre);
    document.querySelector("#metadata")?.append(metadataDiv);
    // enable button
    installButton.disabled = false;
})();
