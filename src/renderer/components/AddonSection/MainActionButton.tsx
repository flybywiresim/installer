import React, { FC } from "react";
import { ButtonType } from "renderer/components/Button";
import { SidebarButton } from "renderer/components/AddonSection/index";
import { InstallStatus, ApplicationStatus } from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";

interface ActiveInstallButtonProps {
    installStatus: InstallStatus,
    onInstall: () => void,
    onCancel: () => void,
}

export const MainActionButton: FC<ActiveInstallButtonProps> = ({
    installStatus,
    onInstall,
    onCancel
}): JSX.Element => {
    const applicationStatus = useAppSelector(state => state.applicationStatus);
    if (applicationStatus.msfs !== ApplicationStatus.Closed || applicationStatus.mcduServer !== ApplicationStatus.Closed) {
        return (
            <SidebarButton disabled>
                Unavailable
            </SidebarButton>
        );
    }

    switch (installStatus) {
        case InstallStatus.DownloadDone:
        case InstallStatus.UpToDate:
            return (
                <SidebarButton disabled type={ButtonType.Positive}>
                    Installed
                </SidebarButton>
            );
        case InstallStatus.NeedsUpdate:
            return (
                <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
                    Update
                </SidebarButton>
            );
        case InstallStatus.NotInstalled:
            return (
                <SidebarButton type={ButtonType.Positive} onClick={onInstall}>
                    Install
                </SidebarButton>
            );
        case InstallStatus.GitInstall:
            return (
                <SidebarButton disabled type={ButtonType.Positive} onClick={onInstall}>
                    Installed (git)
                </SidebarButton>
            );
        case InstallStatus.TrackSwitch:
            return (
                <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
                    Switch Version
                </SidebarButton>
            );
        case InstallStatus.DownloadPrep:
            return (
                <SidebarButton disabled type={ButtonType.Danger}>
                    Cancel
                </SidebarButton>
            );
        case InstallStatus.Downloading:
            return (
                <SidebarButton type={ButtonType.Danger} onClick={onCancel}>
                    Cancel
                </SidebarButton>
            );
        case InstallStatus.Decompressing:
        case InstallStatus.DownloadEnding:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Cancel
                </SidebarButton>
            );
        case InstallStatus.DownloadCanceled:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Cancelled
                </SidebarButton>
            );
        case InstallStatus.DownloadRetry:
        case InstallStatus.DownloadError:
        case InstallStatus.Unknown:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Error
                </SidebarButton>
            );
        default:
            return <></>;
    }
};
