import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppStateProvider } from "./InstalledApp/StateContext";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import { Router } from "@reach/router";
import { EditPage } from "./InstalledApp/pages/EditPage";

const url = new URL(location.href);
const name = url.searchParams.get("name") ?? undefined;
const namespace = url.searchParams.get("namespace") ?? undefined;
ReactDOM.render(
    <AppStateProvider>
        <Provider theme={defaultTheme}>
            <Router>
                <EditPage default name={name} namespace={namespace} />
            </Router>
        </Provider>
    </AppStateProvider>,
    document.querySelector("#js-app")
);
