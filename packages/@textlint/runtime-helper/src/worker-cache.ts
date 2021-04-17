import { kvsEnvStorage } from "@kvs/env";

/**
 * Simple KVS on WebWorker
 * @param dbName
 */
export async function openStorage<V>(dbName: string) {
    const storage = await kvsEnvStorage<any>({
        version: 1,
        name: "@textlint/runtime-helper"
    });
    return {
        get(key: string): Promise<V | undefined> {
            return storage.get(dbName + "::" + key);
        },
        async set(key: string, value: V): Promise<void> {
            await storage.set(dbName + "::" + key, value);
            return;
        },
        clear(): Promise<void> {
            return storage.clear();
        }
    };
}
