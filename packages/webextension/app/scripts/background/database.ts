import { kvsEnvStorage } from "@kvs/env";
import minimatch from "minimatch";

export type Script = {
    namespace: string;
    name: string;
    scriptUrl: string;
    homepage: string;
    version: string;
    code: string;
    ext: string;
    textlintrc: string;
    matchPattern: string;
};

export type TextlintDBSchema = {
    scripts: Script[];
};
/**
 * Create unique key of Script
 * @param script
 */
export const keyOfScript = (script: { name: string; namespace: string }): string => {
    return `${script.namespace}@${script.name}`;
};
const equalScript = (a: { name: string; namespace: string }, b: { name: string; namespace: string }): boolean => {
    return keyOfScript(a) === keyOfScript(b);
};

export async function openDatabase() {
    const db = await kvsEnvStorage<TextlintDBSchema>({
        name: "textlintjs-db",
        version: 1
    });
    return {
        async addScript(newScript: Script): Promise<void> {
            const scripts = (await db.get("scripts")) ?? [];
            const hasScript = scripts.some((script) => equalScript(newScript, script));
            if (hasScript) {
                await this.updateScript(newScript);
                return;
            }
            await db.set("scripts", scripts.concat(newScript));
            return;
        },
        async findScriptsWithName({
            name,
            namespace
        }: {
            name: string;
            namespace: string;
        }): Promise<Script | undefined> {
            const scripts = (await db.get("scripts")) ?? [];
            return scripts.find((script) => {
                return script.name === name && script.namespace === namespace;
            });
        },
        async findScriptsWithPatten(url: string): Promise<Script[]> {
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
                    return !equalScript(script, { name, namespace });
                })
            );
        }
    };
}
