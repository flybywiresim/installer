import { InstallStatus, MsfsStatus } from "renderer/components/AircraftSection/Enums";
import { DownloadItem } from "renderer/redux/types";
import React, { FC } from "react";

const StateText: FC = ({ children }) => (
    <div className="text-white text-2xl font-bold">{children}</div>
);

interface ActiveStateProps {
    msfsIsOpen: MsfsStatus,
    installStatus: InstallStatus,
    download: DownloadItem,
}

export const ActiveStateText: FC<ActiveStateProps> = ({ msfsIsOpen, installStatus, download }): JSX.Element => {
    if (msfsIsOpen !== MsfsStatus.Closed) {
        return (
            <StateText>{msfsIsOpen === MsfsStatus.Open ? "Please close MSFS" : "Checking status..."}</StateText>
        );
    }

    switch (installStatus) {
        case InstallStatus.UpToDate:
            return <></>;
        case InstallStatus.NeedsUpdate:
            return <StateText>New release available</StateText>;
        case InstallStatus.NotInstalled:
            return <></>;
        case InstallStatus.GitInstall:
            return <></>;
        case InstallStatus.TrackSwitch:
            return <></>;
        case InstallStatus.DownloadPrep:
            return <StateText>Preparing update</StateText>;
        case InstallStatus.Downloading:
            return <StateText>{`Downloading ${download?.module.toLowerCase()} module`}</StateText>;
        case InstallStatus.Decompressing:
            return <StateText>Decompressing</StateText>;
        case InstallStatus.DownloadEnding:
            return <StateText>Finishing update</StateText>;
        case InstallStatus.DownloadDone:
            return <StateText>Completed!</StateText>;
        case InstallStatus.DownloadRetry:
            return <StateText>Retrying {download?.module.toLowerCase()} module</StateText>;
        case InstallStatus.DownloadError:
            return <StateText>Failed to install</StateText>;
        case InstallStatus.DownloadCanceled:
            return <StateText>Download canceled</StateText>;
        case InstallStatus.Unknown:
            return <StateText>Unknown state</StateText>;
        default:
            return <></>;
    }
};
