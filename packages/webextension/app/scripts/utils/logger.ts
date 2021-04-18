// contentScript does not loggin in production by default
const canLog = () => {
    // localStorage.setItem("DEBUG", "@textlint/editor");
    const enabledDebugStorage =
        typeof window !== "undefined" &&
        typeof window.localStorage !== "undefined" &&
        (window.localStorage.getItem("DEBUG")?.includes("@textlint") || window.localStorage.getItem("DEBUG") === "*");
    // ?debug_textlint
    const enabledDebugLocation =
        typeof window !== "undefined" &&
        typeof window.location !== "undefined" &&
        new URL(window.location.href).searchParams.has("debug_textlint");

    return process.env.NODE_ENV === "development" || enabledDebugLocation || enabledDebugStorage;
};
export const logger = {
    log(...args: any[]) {
        if (!canLog()) {
            return;
        }
        console.log("[@textlint/editor]", ...args);
    },
    error(...args: any[]) {
        if (!canLog()) {
            return;
        }
        console.error("[@textlint/editor]", ...args);
    }
};
