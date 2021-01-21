const debugStorageValue = localStorage.DEBUG || "";
const DEBUG =
    debugStorageValue === "*" || debugStorageValue.startsWith("@textlint") || process.env.NODE_ENV === "development";
export const debug = (...args: any): void => {
    if (!DEBUG) {
        return;
    }
    console.log("[textchecker-element]", ...args);
};
