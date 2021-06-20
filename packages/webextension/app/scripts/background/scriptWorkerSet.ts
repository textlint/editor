import { TextlintWorker } from "./textlint";
import { keyOfScript, Script } from "./database";
import { logger } from "../utils/logger";
import QuickLRU from "quick-lru";

// worker: Set<url>
const workerLRU = new QuickLRU<string, TextlintWorker>({
    // Max TTL is 30min
    maxAge: 1000 * 60 * 30,
    // Max worker size
    maxSize: 16,
    onEviction: (scriptKey, worker) => {
        logger.log(`onEviction: TextlintWorker(${scriptKey} disposed`);
        worker.dispose();
    }
});
const deleteWorker = (scirpt: Script) => {
    const scriptKey = keyOfScript(scirpt);
    const worker = workerLRU.get(scriptKey);
    if (!worker) {
        return;
    }
    logger.log(`TextlintWorker(${scriptKey} disposed`);
    worker.dispose();
};
export const scriptWorkerSet = {
    get(script: Script) {
        return workerLRU.get(keyOfScript(script));
    },
    has(script: Script) {
        return workerLRU.has(keyOfScript(script));
    },
    add({ script, worker }: { script: Script; worker: TextlintWorker }) {
        return workerLRU.set(keyOfScript(script), worker);
    },
    delete({ script }: { script: Script }) {
        deleteWorker(script);
        return workerLRU.delete(keyOfScript(script));
    },
    dump() {
        logger.log("Running Workers", [...workerLRU.entriesDescending()]);
    }
};
