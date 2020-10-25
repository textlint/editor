import React from "react";
import { TextField, Form } from "@adobe/react-spectrum";

export type ScriptMetaProps = {
    name: string;
    namespace: string;
    pattern: string;
    ext: string;
};
export const ScriptMeta = (props: ScriptMetaProps) => {
    return (
        <>
            <h3 id="label-3">Script Information</h3>
            <Form maxWidth="size-3600" aria-labelledby="label-3">
                <TextField label="Namespace" value={props.namespace} isReadOnly={true} />
                <TextField label="Name" value={props.name} isReadOnly={true} />
                <TextField label="Pattern" value={props.pattern} isReadOnly={true} />
                <TextField label="File Extension" value={props.ext} isReadOnly={true} />
            </Form>
        </>
    );
};
