import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { backgroundExposedObject } from "./background";
import { browser } from "webextension-polyfill-ts";

const port = Comlink.wrap<backgroundExposedObject>(createEndpoint(browser.runtime.connect()));

async function installHandler() {
    const url = new URL(location.href);
    const script = url.searchParams.get("script");
    if (!script) {
        throw new Error(`?script is not found: ${location.href}`);
    }
    const scriptURL = decodeURIComponent(script);
    const content = await fetch(scriptURL).then((res) => res.text());
    console.log(content);
    // Save to DB
    await port.addScript({
        name: location.href,
        code: content,
        pattern: "**/*"
    });
}

document.querySelector("#js-install-button")?.addEventListener("click", installHandler);
