import React, { useState } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { ActionButton } from "@adobe/react-spectrum";
import type { Editor } from "codemirror";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
export type TextlintrcEditorProps = {
    textlintrc: string;
    onSave: (textlintrc: string) => void;
};
export const TextlintrcEditor = (props: TextlintrcEditorProps) => {
    const [codeMirror, setCodemirror] = useState<Editor | null>(null);
    const onSave = React.useCallback(() => {
        if (!codeMirror) {
            return;
        }
        const value = codeMirror.getValue();
        try {
            JSON.parse(value);
        } catch (error) {
            alert(".textlintrc should be JSON format. Parse Error:" + error);
            return;
        }
        props.onSave(value);
    }, [codeMirror]);
    return (
        <div className={"TextlintrcEditor"}>
            <label>.textlintrc.json</label>
            <CodeMirror
                value={props.textlintrc}
                options={{
                    mode: {
                        name: "javascript",
                        json: true
                    },
                    lineNumbers: true
                }}
                editorDidMount={(editor) => {
                    setCodemirror(editor);
                }}
            />
            <ActionButton onPress={onSave}>Save</ActionButton>
        </div>
    );
};
