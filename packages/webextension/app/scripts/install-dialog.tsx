import { createEndpoint } from "comlink-extension";
import * as Comlink from "comlink";
import type { BackgroundToPopupObject } from "./background";
import { browser } from "webextension-polyfill-ts";
import { parseMetadata, TextlintScriptMetadata } from "@textlint/script-parser";
import { logger } from "./utils/logger";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

const port = Comlink.wrap<BackgroundToPopupObject>(createEndpoint(browser.runtime.connect()));

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
        throw error;
    }
}

function App() {
    const [install, setInstall] = useState<"Install" | "Installed" | "Waiting">("Waiting");
    const [scriptURL, setScriptURL] = useState<string>("");
    const [scriptContent, setScriptContent] = useState<string>("");
    const [metadata, setMetadata] = useState<null | TextlintScriptMetadata>(null);
    const onInstall = useCallback(() => {
        if (!metadata) {
            return;
        }
        installHandler({
            metadata,
            script: scriptContent,
            scriptURL
        }).catch((error) => {
            console.error(error);
            setInstall("Install");
        });
        setInstall("Installed");
    }, [scriptContent, metadata, scriptURL]);
    useEffect(() => {
        (async function main() {
            setInstall("Install");
            const url = new URL(location.href);
            const script = url.searchParams.get("script");
            if (!script) {
                throw new Error(`script is not found: ${location.href}`);
            }
            const scriptURL = decodeURIComponent(script);
            const content = await fetch(scriptURL).then((res) => res.text());
            const metadata = parseMetadata(content);
            setMetadata(metadata);
            setScriptContent(content);
            setScriptURL(scriptURL);
        })();
    }, []);
    return (
        <div className={"content"}>
            <h1>Installation @textlint/editor script</h1>
            <p>You can install the script via "Install" button.</p>
            <div>
                <button
                    id="js-install-button"
                    className="install-button"
                    disabled={install !== "Install"}
                    onClick={onInstall}
                >
                    {install}
                </button>
                {install === "Installed" ? "Success to install!" : null}
            </div>
            <div id="metadata" className="metadata">
                <h3>Script metadata</h3>
                {metadata ? <pre>{JSON.stringify(metadata, null, 4)}</pre> : null}
            </div>
            <div id="script-content" className="script-content">
                <h3>Script content</h3>
                {scriptContent ? <pre>{scriptContent}</pre> : null}
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#root"));
