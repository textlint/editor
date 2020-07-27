import { browser } from "webextension-polyfill-ts";
import { TextlintResult } from "@textlint/types";

browser.runtime.onInstalled.addListener((details) => {
    console.log('previousVersion', details.previousVersion)
})

browser.tabs.onUpdated.addListener(async (tabId) => {
    browser.pageAction.show(tabId)
})

const worker = new Worker('download/textlint.js');
const waiterForInit = () => {
    let initialized = false;
    let _resolve: null | ((init: boolean) => void) = null;
    const deferred = new Promise((resolve) => {
        _resolve = resolve;
    })
    worker.addEventListener('message', function (event) {
        if (event.data.command === "init") {
            initialized = true;
            _resolve && _resolve(initialized);
        }
    }, {
        once: true
    })
    return {
        ready() {
            return deferred;
        }
    }
}
const workerStatus = waiterForInit();
const lint = async (message: string): Promise<TextlintResult> => {
    console.log("worker", worker);
    await workerStatus.ready();
    return new Promise((resolve, _reject) => {
        worker.addEventListener('message', function (event) {
            if (event.data.command === "lint:result") {
                resolve(event.data.result);
            }
        }, {
            once: true
        });
        return worker.postMessage({
            command: "lint",
            text: message,
            ext: ".md"
        });
    });
};
// receive
browser.runtime.onConnect.addListener(port => {
    console.log(port);
    if (port.name !== "textlint-editor") {
        return;
    }
    port.onMessage.addListener((message) => {
        if (message.command === "lint") {
            return lint(message.text).then(result => {
                console.log("lint", result);
                port.postMessage({
                    command: "lint::result",
                    result
                });
            });
        }
        console.log(message);
        return;
    });
});

// @ts-ignore
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "lint") {
        return lint(message.text).then(result => {
            console.log("lint", result);
            return result;
        });
    }
    console.log(message);
});

