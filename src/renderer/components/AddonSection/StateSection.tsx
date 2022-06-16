import React, { FC, useState } from "react";
import { ApplicationStatus, InstallingInstallStatuses, InstallStatus } from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";
import { Addon } from "renderer/utils/InstallerConfiguration";
import { InstallingDependencyInstallState, InstallState } from "renderer/redux/features/installStatus";
import { DownloadItem } from "renderer/redux/types";
import { ExclamationTriangle } from "react-bootstrap-icons";

export interface StateSectionProps {
    addon: Addon,
}

export const StateSection: FC<StateSectionProps> = ({ addon }) => {
    const [hasInfoMessage, setHasInfoMessage] = useState(false);
    const [hasCautionMessage, setHasCautionMessage] = useState(false);

    const installStates = useAppSelector(state => state.installStatus);
    const downloads = useAppSelector(state => state.downloads);

    const addonInstallState = installStates[addon.key];
    const addonDownload = downloads.find((it) => it.id === addon.key);

    if (!addonInstallState) {
        return null;
    }

    const status = addonInstallState.status;

    const isInstallingDependency = status === InstallStatus.InstallingDependency;
    const isInstalling = InstallingInstallStatuses.includes(status);

    let progress;
    let dependencyAddonDownload;
    let dependencyAddonInstallState;
    if (isInstallingDependency) {
        const dependencyAddonKey = (addonInstallState as InstallingDependencyInstallState).dependencyAddonKey;

        dependencyAddonInstallState = installStates[dependencyAddonKey];
        dependencyAddonDownload = downloads.find((it) => it.id === dependencyAddonKey);

        if (dependencyAddonDownload) {
            progress = dependencyAddonDownload.progress;
        }
    } else if (addonDownload) {
        progress = addonDownload.progress;
    }

    const downloadToShowExists = !!(addonDownload || dependencyAddonDownload);
    const progressToShowExists = status === InstallStatus.Downloading || dependencyAddonInstallState?.status === InstallStatus.Downloading;

    return (
        <>
            <StateContainer visible={hasInfoMessage || hasCautionMessage}>
                <ActiveStateText
                    installState={dependencyAddonInstallState ?? addonInstallState}
                    download={dependencyAddonDownload ?? addonDownload}
                    isDependency={isInstallingDependency}
                    onInfoMessageStateChanged={setHasInfoMessage}
                    onCautionMessageStateChanged={setHasCautionMessage}
                />
                {downloadToShowExists && progressToShowExists && (
                    // TODO: Replace this with a JIT value
                    <div
                        className="text-white font-semibold"
                        style={{ fontSize: "38px" }}
                    >
                        {progress}%
                    </div>
                )}
            </StateContainer>
            {((downloadToShowExists && isInstalling) || hasCautionMessage) && (
                <div className="absolute left-0 -bottom-1 w-full h-2 z-10 bg-black">
                    <div
                        className={`absolute h-2 z-11 ${hasCautionMessage ? 'bg-utility-amber' : 'bg-cyan'} progress-bar-animated`}
                        style={{ width: hasCautionMessage ? '100%' : `${progress}%` }}
                    />
                </div>
            )}
        </>
    );
};

const StateContainer: FC<{ visible: boolean }> = ({ visible, children }) => {
    return (
        <div
            className="absolute h-32 bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full bg-navy bg-opacity-80"
            style={{ visibility: visible ? 'visible' : 'hidden' }}
        >
            {children}
        </div>
    );
};

const SmallStateText: FC = ({ children }) => (
    <div className="text-white text-2xl font-bold">{children}</div>
);
const StateText: FC = ({ children }) => (
    <div className="text-white text-3xl font-bold">{children}</div>
);

interface ActiveStateProps {
    installState: InstallState,
    download: DownloadItem,
    isDependency: boolean,
    onInfoMessageStateChanged: (visible: boolean) => void,
    onCautionMessageStateChanged: (visible: boolean) => void,
}

export const ActiveStateText: FC<ActiveStateProps> = ({ installState, download, isDependency, onInfoMessageStateChanged, onCautionMessageStateChanged }): JSX.Element => {
    const applicationStatus = useAppSelector(state => state.applicationStatus);

    if (applicationStatus.msfs !== ApplicationStatus.Closed) {
        onInfoMessageStateChanged(false);
        onCautionMessageStateChanged(true);

        return (
            <div className="flex gap-x-7 items-center">
                <ExclamationTriangle size={32} className="text-utility-amber fill-current" />

                <div className="flex flex-col gap-y-2">
                    <SmallStateText>Cannot install</SmallStateText>
                    <StateText>{applicationStatus.msfs === ApplicationStatus.Open ? "Please close MSFS" : "Checking status..."}</StateText>
                </div>
            </div>
        );
    }

    if (applicationStatus.mcduServer !== ApplicationStatus.Closed) {
        onInfoMessageStateChanged(false);
        onCautionMessageStateChanged(true);

        return (
            <StateText>{applicationStatus.mcduServer === ApplicationStatus.Open ? "Please close the MCDU server" : "Checking status..."}</StateText>
        );
    }

    if (!installState || !download) {
        onInfoMessageStateChanged(false);
        onCautionMessageStateChanged(false);

        return null;
    }

    let stateText;
    switch (installState.status) {
        case InstallStatus.UpToDate:
            stateText = <></>;
            break;
        case InstallStatus.NeedsUpdate:
            stateText = <StateText>New release available</StateText>;
            break;
        case InstallStatus.DownloadPrep:
            stateText = <StateText>Preparing update</StateText>;
            break;
        case InstallStatus.Downloading:
            stateText = <StateText>{`Downloading ${download?.module.toLowerCase()} module`}</StateText>;
            break;
        case InstallStatus.Decompressing:
            stateText = <StateText>Decompressing</StateText>;
            break;
        case InstallStatus.DownloadEnding:
            stateText = <StateText>Finishing update</StateText>;
            break;
        case InstallStatus.DownloadDone:
            stateText = <StateText>Completed!</StateText>;
            break;
        case InstallStatus.DownloadRetry:
            stateText = <StateText>Retrying {download?.module.toLowerCase()} module</StateText>;
            break;
        case InstallStatus.DownloadError:
            stateText = <StateText>Failed to install</StateText>;
            break;
        case InstallStatus.DownloadCanceled:
            stateText = <StateText>Download canceled</StateText>;
            break;
        case InstallStatus.Unknown:
            stateText = <StateText>Unknown state</StateText>;
            break;
        case InstallStatus.NotInstalled:
        case InstallStatus.GitInstall:
        case InstallStatus.TrackSwitch:
        default:
            stateText = <></>;
            break;
    }

    onInfoMessageStateChanged(true);
    onCautionMessageStateChanged(false);

    return (
        <div className="flex flex-col gap-y-2">
            <SmallStateText>Installing {isDependency ? 'Dependency' : ''}</SmallStateText>

            {stateText}
        </div>
    );
};
