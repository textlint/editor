// @ts-ignore
import storage from "kv-storage-polyfill";

/**
 * Simple KVS on WebWorker
 * @param dbName
 */
export function openStorage<V>(dbName: string) {
    return {
        get(key: string): Promise<V | undefined> {
            return storage.get(dbName + "::" + key);
        },
        set(key: string, value: V): Promise<void> {
            return storage.set(dbName + "::" + key, value);
        },
        clear(): Promise<void> {
            return storage.clear();
        }
    }
}
