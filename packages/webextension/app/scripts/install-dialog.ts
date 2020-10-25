import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";
import { browser } from "webextension-polyfill-ts";
import { parseMetadata } from "@textlint/script-parser";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));

async function installHandler() {
    const url = new URL(location.href);
    const script = url.searchParams.get("script");
    if (!script) {
        throw new Error(`?script is not found: ${location.href}`);
    }
    const scriptURL = decodeURIComponent(script);
    const content = await fetch(scriptURL).then((res) => res.text());
    console.log("[InstallDialog]", content.slice(500));
    try {
        const parseResult = parseMetadata(content);
        console.log("[InstallDialog] metadata", parseResult);
        // Save to DB
        await port.addScript({
            name: parseResult.name,
            namespace: parseResult.namespace,
            code: content,
            matchPattern: "**/*",
            textlintrc: JSON.stringify(parseResult.config, null, 4)
        });
        window.close();
    } catch (error) {
        console.error("[InstallDialog]", error);
    }
}

document.querySelector("#js-install-button")?.addEventListener("click", installHandler);
