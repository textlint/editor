import { useAsyncList } from "@react-stately/data";
import React from "react";
import { ActionGroup, Flex, Item, ListBox, Text } from "@adobe/react-spectrum";
import { usePort } from "../StateContext";
import { ScriptValue } from "../../background/openDatabase";
import FileCode from "@spectrum-icons/workflow/FileCode";

export type InstalledTextlintListProps = {
    url: string;
};
export const InstalledTextlintList = (props: InstalledTextlintListProps) => {
    const port = usePort();
    const list = useAsyncList<ScriptValue>({
        async load() {
            try {
                const res = await port.findScriptsWithPatten(props.url);
                return {
                    items: res
                };
            } catch (error) {
                console.error(error);
                return {
                    items: []
                };
            }
        }
    });
    const onDelete = async (name: string) => {
        await port.deleteScript(name);
        list.reload();
    };
    return (
        <Flex maxHeight="size-2400">
            <ListBox
                aria-label="Pick a Pokemon"
                items={list.items}
                isLoading={list.isLoading}
                onLoadMore={list.loadMore}
                width="size-6000"
            >
                {(item) => (
                    <Item key={item.name}>
                        <FileCode aria-label={"FileCode"} size="S" />
                        <Text>{item.name}</Text>
                        <Text slot="description" marginTop={"size-100"}>
                            <ActionGroup
                                onAction={(key) => {
                                    switch (key) {
                                        case "delete": {
                                            return onDelete(item.name);
                                        }
                                        case "edit": {
                                            return;
                                        }
                                        default:
                                            return console.warn("Unknown key", key);
                                    }
                                }}
                            >
                                <Item key="edit">Edit</Item>
                                <Item key="delete">Delete</Item>
                            </ActionGroup>
                        </Text>
                    </Item>
                )}
            </ListBox>
        </Flex>
    );
};
