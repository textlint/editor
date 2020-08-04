import React from "react";
import { InstalledTextlintList } from "./component/InstalledTextlintList";

export const InstalledApp = () => {
    return (
        <div className={"InstalledApp"}>
            <InstalledTextlintList url={location.href} />
        </div>
    );
};
