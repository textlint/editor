import { DBSchema, openDB, StoreValue } from "idb";
import minimatch from "minimatch";

interface TextlintJsDB extends DBSchema {
    scripts: {
        value: {
            name: string;
            namespace: string;
            code: string;
            matchPattern: string;
        };
        key: string;
        indexes: { "by-name": string };
    };
}

export type ScriptValue = StoreValue<TextlintJsDB, "scripts">;

export async function openDatabase() {
    const db = await openDB<TextlintJsDB>("textlintjs-db", 1, {
        upgrade(db) {
            const productStore = db.createObjectStore("scripts", {
                keyPath: "name"
            });
            productStore.createIndex("by-name", "name", { unique: true });
        }
    });
    return {
        async addScript(script: ScriptValue) {
            return db.add("scripts", script);
        },
        async findScriptsWithPatten(url: string) {
            const scripts = await db.getAll("scripts");
            return scripts.filter((script) => {
                return minimatch(url, script.matchPattern);
            });
        },
        async deleteScript(scriptName: ScriptValue["name"]) {
            return db.delete("scripts", scriptName);
        }
    };
}
