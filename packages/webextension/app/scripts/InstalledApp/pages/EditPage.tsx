import React, { useEffect, useState } from "react";
import { TextlintrcEditor } from "../component/TextlintrcEditor";
import { RouteComponentProps } from "@reach/router";
import { usePort } from "../StateContext";
import { ScriptMeta } from "../component/ScriptMeta";
import "./EditPage.css";

export type EditPageProps = {
    name?: string;
    namespace?: string;
} & RouteComponentProps;
export const EditPage = (props: EditPageProps) => {
    const [script, setScript] = useState("");
    const [meta, setMeta] = useState({
        name: "",
        namespace: "",
        pattern: "",
        ext: ""
    });
    const port = usePort();
    const onSave = (textlintrc: string) => {
        if (!props.name || !props.namespace) {
            console.error("props is wrong", props);
            return;
        }
        port.updateScript({
            name: props.name,
            namespace: props.namespace,
            textlintrc: textlintrc
        });
    };
    useEffect(() => {
        (async function loadScript() {
            if (!props.name || !props.namespace) {
                console.error("props is wrong", props);
                return;
            }
            const script = await port.findScriptsWithName({ name: props.name, namespace: props.namespace });
            if (!script) {
                return console.error("script is not found", props);
            }
            console.log();
            setMeta({
                name: script.name,
                namespace: script.namespace,
                pattern: script.matchPattern,
                ext: script.ext
            });
            setScript(script.textlintrc);
        })();
    });
    return (
        <div className={"EditPage"}>
            <ScriptMeta {...meta} />
            <TextlintrcEditor textlintrc={script} onSave={onSave} />
        </div>
    );
};
