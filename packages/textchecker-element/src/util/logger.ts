const debugStorageValue = localStorage.DEBUG ?? "";
const DEBUG = debugStorageValue === "*" ?? debugStorageValue.startsWith("@textlint");
export const debug = (...args: any): void => {
    if (!DEBUG) {
        return;
    }
    console.log("[textchecker-element]", ...args);
};
