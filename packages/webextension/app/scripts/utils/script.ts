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

/**
 * Create unique key of Script
 * @param script
 */
export const keyOfScript = (script: { name: string; namespace: string }): string => {
    return `${script.namespace}@${script.name}`;
};
