import { TextlintWorker } from "./textlint";
import { keyOfScript, Script } from "./database";

// worker: Set<url>
const _workerRunningUrlMap = new Map<TextlintWorker, Set<string>>();
const _scriptRunningWorkerMap = new Map<string, TextlintWorker>();
export const scriptWorkerSet = {
    get(script: Script) {
        return _scriptRunningWorkerMap.get(keyOfScript(script));
    },
    has(script: Script) {
        return _scriptRunningWorkerMap.has(keyOfScript(script));
    },
    add({ script, worker, url }: { script: Script; worker: TextlintWorker; url: string }) {
        const set = _workerRunningUrlMap.get(worker) ?? new Set<string>();
        set.add(url);
        _workerRunningUrlMap.set(worker, set);
        return _scriptRunningWorkerMap.set(keyOfScript(script), worker);
    },
    delete({ script, url }: { script: Script; url: string }) {
        for (const [worker, urlSet] of _workerRunningUrlMap.entries()) {
            if (urlSet.has(url)) {
                urlSet.delete(url);
            }
            if (urlSet.size === 0) {
                worker.dispose();
                _workerRunningUrlMap.delete(worker);
            }
        }
        return _scriptRunningWorkerMap.delete(keyOfScript(script));
    },
    dump() {
        console.log("Running Scripts: ", _scriptRunningWorkerMap.keys());
        console.log("Running Workers x URLs: ", _workerRunningUrlMap.entries());
    }
};
