export type TextlintScriptMetadata = {
    name: string;
    namespace: string;
};
export type TextlintScriptParseResult = {
    metadata: TextlintScriptMetadata;
};
export const parseMetadata = (scriptContent: string): TextlintScriptMetadata => {
    const metadataPattenr = /\/*! textlinteditor: (.*)\*\//;
    const match = scriptContent.match(metadataPattenr);
    if (!match) {
        throw new Error("Can not read metadata");
    }
    try {
        return JSON.parse(match[1]);
    } catch (error) {
        console.error(error);
        throw new Error("Can not parse metadata. It should be JSON format.");
    }
};
