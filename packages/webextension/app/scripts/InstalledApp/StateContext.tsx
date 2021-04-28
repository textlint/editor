// src/contexts/AppStateContext.tsx
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import * as Comlink from "comlink";
import { forward } from "comlink-extension";
import { BackgroundPopupObject } from "../background";
const { port1, port2 } = new MessageChannel();
forward(port1, browser.runtime.connect());
// content-script <-> background page
const port = Comlink.wrap<BackgroundPopupObject>(port2);
export type AppState = {
    value: number;
};

const initialState: AppState = {
    value: 0
};

const PortStateContext = React.createContext<BackgroundPopupObject>(port);
const AppStateContext = React.createContext<AppState>(initialState);
const SetAppStateContext = React.createContext<Dispatch<SetStateAction<AppState>>>(() => {});

export function usePort() {
    return useContext(PortStateContext);
}

export function useAppState() {
    return useContext(AppStateContext);
}

export function useSetAppState() {
    return useContext(SetAppStateContext);
}

export function AppStateProvider(props: { initialState?: AppState; children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(props.initialState ?? initialState);
    return (
        <PortStateContext.Provider value={port}>
            <AppStateContext.Provider value={state}>
                <SetAppStateContext.Provider value={setState}>{props.children}</SetAppStateContext.Provider>
            </AppStateContext.Provider>
        </PortStateContext.Provider>
    );
}
