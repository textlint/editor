import browser from "webextension-polyfill";

const isTextlintWorkerUrl = (urlString: string): boolean => {
    try {
        const url = new URL(urlString);
        return /textlint-worker\.js$/.test(url.pathname);
    } catch {
        return false;
    }
};
export type listenOnTextlintWorkerJsUrlArgs = {
    onTextlintWorkerUrl: ({ tabId, url }: { tabId: number; url: string }) => void;
};
// On access http?://**/*textlint-worker.js
export const listenOnTextlintWorkerJsUrl = (args: listenOnTextlintWorkerJsUrlArgs) => {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
        if (changeInfo && changeInfo.url && isTextlintWorkerUrl(changeInfo.url)) {
            args.onTextlintWorkerUrl({
                tabId,
                url: changeInfo.url
            });
        }
    });
    browser.tabs.onActivated.addListener(async (activeInfo) => {
        const tab = await browser.tabs.get(activeInfo.tabId);
        if (tab && tab.id && tab.url && isTextlintWorkerUrl(tab.url)) {
            args.onTextlintWorkerUrl({
                tabId: tab.id,
                url: tab.url
            });
        }
    });
};
