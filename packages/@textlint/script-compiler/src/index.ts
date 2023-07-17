export { createWebpackConfig, compile, compileOptions, validateTextlintScriptMetadata } from "./compiler";
// TODO: move to separate package
export type {
    TextlintWorkerCommand,
    TextlintWorkerCommandResponse,
    TextlintWorkerCommandMergeConfig,
    TextlintWorkerCommandFix,
    TextlintWorkerCommandLint,
    TextlintWorkerCommandResponseFix,
    TextlintWorkerCommandResponseInit,
    TextlintWorkerCommandResponseLint,
    TextlintWorkerCommandResponseError
} from "./CodeGenerator/worker-codegen";
