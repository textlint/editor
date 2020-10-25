import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppStateProvider } from "./InstalledApp/StateContext";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import { Router } from "@reach/router";
import { InstalledAppPage } from "./InstalledApp/pages/InstalledAppPage";
import { EditPage } from "./InstalledApp/pages/EditPage";

ReactDOM.render(
    <AppStateProvider>
        <Provider theme={defaultTheme}>
            <Router>
                <InstalledAppPage default />
                <EditPage path={"/edit/:namespace/:name"} />
            </Router>
        </Provider>
    </AppStateProvider>,
    document.querySelector("#js-app")
);
