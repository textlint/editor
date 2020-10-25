import React from "react";
import { InstalledTextlintList } from "../component/InstalledTextlintList";
import { RouteComponentProps } from "@reach/router";

export const InstalledAppPage = (_props: RouteComponentProps) => {
    return (
        <div className={"InstalledApp"}>
            <InstalledTextlintList url={location.href} />
        </div>
    );
};
