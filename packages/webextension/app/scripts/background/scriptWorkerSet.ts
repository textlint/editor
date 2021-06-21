import { TextlintWorker } from "./textlint";
import { keyOfScript, Script } from "./database";
import { logger } from "../utils/logger";

const workerMap = new Map<string, TextlintWorker>();
const deleteWorker = (scirpt: Script) => {
    const scriptKey = keyOfScript(scirpt);
    const worker = workerMap.get(scriptKey);
    if (!worker) {
        return;
    }
    logger.log(`TextlintWorker(${scriptKey}) is disposed`);
    worker.dispose();
};
const updateWorker = (script: Script, newWorker: TextlintWorker): void => {
    const scriptKey = keyOfScript(script);
    const worker = workerMap.get(scriptKey);
    if (!worker) {
        workerMap.set(scriptKey, newWorker);
    } else {
        deleteWorker(script);
        workerMap.set(scriptKey, newWorker);
    }
};
export const scriptWorkerSet = {
    get(script: Script) {
        return workerMap.get(keyOfScript(script));
    },
    has(script: Script) {
        return workerMap.has(keyOfScript(script));
    },
    set({ script, worker }: { script: Script; worker: TextlintWorker }) {
        return updateWorker(script, worker);
    },
    delete({ script }: { script: Script }) {
        deleteWorker(script);
        return workerMap.delete(keyOfScript(script));
    },
    dump() {
        logger.log("Running Workers", [...workerMap]);
    }
};
