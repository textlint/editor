import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextlintrcEditor } from "../component/TextlintrcEditor";
import { RouteComponentProps } from "@gatsbyjs/reach-router";
import { usePort } from "../StateContext";
import "./EditPage.css";
import { ActionButton, Flex, Form, TextField, Text, Link } from "@adobe/react-spectrum";
import { logger } from "../../utils/logger";

export type EditPageProps = {
    name?: string;
    namespace?: string;
} & RouteComponentProps;
export type ScriptMetaProps = {
    name: string;
    namespace: string;
    matchPattern: string;
    ext: string;
    textlintrc: string;
};
const useForm = (props: ScriptMetaProps) => {
    const [name, setName] = useState(props.name);
    const [namespace, setNamespace] = useState(props.namespace);
    const [matchPattern, setMatchPattern] = useState(props.matchPattern);
    const [ext, setExt] = useState(props.ext);
    const [textlintrc, setTextlintrc] = useState(props.textlintrc);
    const [errors, setErrors] = useState<
        Partial<Record<"name" | "namespace" | "matchPattern" | "ext" | "textlintrc", Error | null>>
    >({});
    const isValid = useMemo(() => {
        return Object.values(errors).filter((error) => error instanceof Error).length === 0;
    }, [errors]);
    const errorMessage = useMemo(() => {
        return (
            <div>
                {Object.entries(errors)
                    .filter(([_, error]) => error instanceof Error)
                    .map(([key, error]) => {
                        return (
                            <p key={key}>
                                <span>{key}</span>: {error?.message}
                            </p>
                        );
                    })}
            </div>
        );
    }, [errors]);
    const port = usePort();
    useEffect(() => {
        (async function loadScript() {
            if (!props.name || !props.namespace) {
                logger.error("props is wrong", props);
                return;
            }
            const script = await port.findScriptsWithName({ name: props.name, namespace: props.namespace });
            if (!script) {
                return logger.error("script is not found", props);
            }
            setName(script.name);
            setNamespace(script.namespace);
            setMatchPattern(script.matchPattern);
            setExt(script.ext);
            setTextlintrc(script.textlintrc);
        })();
    }, []);
    const handlers = React.useMemo(
        () => ({
            name: (value: string) => {
                setNamespace(value);
                setErrors((prevState) => {
                    return {
                        ...prevState,
                        name: value.length === 0 ? new Error("name length should be > 0") : null
                    };
                });
            },
            namespace: (value: string) => {
                setNamespace(value);
                setErrors((prevState) => {
                    return {
                        ...prevState,
                        namespace: value.length === 0 ? new Error("namespace length should be > 0") : null
                    };
                });
            },
            matchPattern: (value: string) => {
                setMatchPattern(value);
                setErrors((prevState) => {
                    return {
                        ...prevState,
                        matchPattern: value.length === 0 ? new Error("matchPattern length should be > 0") : null
                    };
                });
            },
            ext: (value: string) => {
                setExt(value);
                setErrors((prevState) => {
                    if (value.length === 0) {
                        return {
                            ...prevState,
                            ext: new Error("ext length should be > 0")
                        };
                    }
                    if (!value.startsWith(".")) {
                        return {
                            ...prevState,
                            ext: new Error("ext should starts with '.'")
                        };
                    }
                    return {
                        ...prevState,
                        ext: null
                    };
                });
            },
            textlintrc: (value: string) => {
                setTextlintrc(value);
                setErrors((prevState) => {
                    try {
                        JSON.parse(value);
                        return {
                            ...prevState,
                            textlintrc: value.length === 0 ? new Error("textlintrc length should be > 0") : null
                        };
                    } catch (error) {
                        return {
                            ...prevState,
                            textlintrc: error instanceof Error ? error : null
                        };
                    }
                });
            }
        }),
        []
    );
    return {
        name,
        namespace,
        matchPattern,
        ext,
        textlintrc,
        errors,
        errorMessage,
        isValid,
        handlers
    };
};
export const EditPage = (props: EditPageProps) => {
    const port = usePort();
    const { name, namespace, matchPattern, ext, textlintrc, handlers, errorMessage, isValid } = useForm({
        name: props.name ?? "",
        namespace: props.namespace ?? "",
        matchPattern: "",
        ext: "",
        textlintrc: ""
    });
    const onSave = useCallback(() => {
        if (!isValid) {
            return;
        }
        port.updateScript({
            name,
            namespace,
            matchPattern,
            ext,
            textlintrc
        });
    }, [name, namespace, matchPattern, ext, textlintrc]);
    return (
        <div className={"EditPage"}>
            <Flex direction="column" gap="size-100">
                <h3 id="label-3">Script Information</h3>
                <Form maxWidth="size-3600" aria-labelledby="label-3">
                    <TextField label="Namespace" value={namespace} isReadOnly={true} isDisabled={true} />
                    <TextField label="Name" value={name} isReadOnly={true} isDisabled={true} />
                    <TextField label="Pattern" value={matchPattern} minLength={1} onChange={handlers.matchPattern} />
                    <Text>
                        pattern use{" "}
                        <Link>
                            <a href="https://github.com/micromatch/micromatch" target={"_blank"}>
                                micromatch
                            </a>
                        </Link>
                    </Text>
                    <TextField label="File Extension" value={ext} minLength={1} onChange={handlers.ext} />
                </Form>
                <TextlintrcEditor textlintrc={textlintrc} onChange={handlers.textlintrc} />
                <ActionButton onPress={onSave} isDisabled={!isValid}>
                    Save
                </ActionButton>
                {errorMessage}
            </Flex>
        </div>
    );
};
