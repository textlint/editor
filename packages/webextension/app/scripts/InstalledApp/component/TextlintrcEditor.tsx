import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { Flex } from "@adobe/react-spectrum";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
export type TextlintrcEditorProps = {
    textlintrc: string;
    onChange: (textlintrc: string) => void;
};
export const TextlintrcEditor = (props: TextlintrcEditorProps) => {
    return (
        <div className={"TextlintrcEditor"}>
            <Flex direction="column" gap="size-100">
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
                    onChange={(editor) => {
                        props.onChange(editor.getValue());
                    }}
                />
            </Flex>
        </div>
    );
};
