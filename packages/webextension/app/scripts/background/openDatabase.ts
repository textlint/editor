import { kvsEnvStorage } from "@kvs/env";
import minimatch from "minimatch";

export type Script = {
    namespace: string;
    name: string;
    code: string;
    ext: string;
    textlintrc: string;
    matchPattern: string;
};

export type TextlintDBSchema = {
    scripts: Script[];
};

export async function openDatabase() {
    const db = await kvsEnvStorage<TextlintDBSchema>({
        name: "textlintjs-db",
        version: 1
    });
    return {
        async addScript(script: Script) {
            const scripts = (await db.get("scripts")) ?? [];
            return db.set("scripts", scripts.concat(script));
        },
        async findScriptsWithName({ name, namespace }: { name: string; namespace: string }) {
            const scripts = (await db.get("scripts")) ?? [];
            return scripts.find((script) => {
                return script.name === name && script.namespace === namespace;
            });
        },
        async findScriptsWithPatten(url: string) {
            const scripts = (await db.get("scripts")) ?? [];
            return scripts.filter((script) => {
                return minimatch(url, script.matchPattern);
            });
        },
        async updateScript(newScript: { namespace: string; name: string } & Partial<Script>) {
            const scripts = (await db.get("scripts")) ?? [];
            const updatedScript = scripts.map((script) => {
                if (script.name === newScript.name && script.namespace === newScript.namespace) {
                    return {
                        ...script,
                        ...newScript
                    };
                }
                return script;
            });
            return db.set("scripts", updatedScript);
        },
        async deleteScript({ name, namespace }: { namespace: string; name: string }) {
            const scripts = (await db.get("scripts")) ?? [];
            if (scripts.length === 0) {
                return;
            }
            return db.set(
                "scripts",
                scripts.filter((script) => {
                    return script.name === name && script.namespace === namespace;
                })
            );
        }
    };
}
