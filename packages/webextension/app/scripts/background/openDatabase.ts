import { openDB, DBSchema, StoreValue } from "idb";
import minimatch from "minimatch";

interface TextlintJsDB extends DBSchema {
    scripts: {
        value: {
            name: string;
            code: string;
            pattern: string;
        };
        key: string;
        indexes: { "by-name": string };
    };
}

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
        async addScript(script: StoreValue<TextlintJsDB, "scripts">) {
            console.log("script", script);
            return db.add("scripts", script);
        },
        async findScriptsWithPatten(url: string) {
            const scripts = await db.getAll("scripts");
            return scripts.filter((script) => {
                const minimatch1 = minimatch(url, script.pattern);
                console.log(minimatch1, url, script.pattern);
                return minimatch1;
            });
        }
    };
}
