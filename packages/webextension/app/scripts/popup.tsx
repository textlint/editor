import * as React from "react";
import * as ReactDOM from "react-dom";
import { InstalledApp } from "./InstalledApp/InstalledApp";
import { AppStateProvider } from "./InstalledApp/StateContext";
import { Provider, defaultTheme } from "@adobe/react-spectrum";

ReactDOM.render(
    <AppStateProvider>
        <Provider theme={defaultTheme}>
            <InstalledApp />
        </Provider>
    </AppStateProvider>,
    document.querySelector("#js-app")
);
