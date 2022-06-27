import React, { FC } from "react";
import { ApplicationStatus, InstallingInstallStatuses, InstallStatus } from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { InstallingDependencyInstallState, InstallState } from "renderer/redux/features/installStatus";
import { DownloadItem } from "renderer/redux/types";
import { Broadcast, ExclamationTriangle } from "react-bootstrap-icons";
import { Resolver } from "renderer/utils/Resolver";
import { BackgroundServices } from "renderer/utils/BackgroundServices";

export interface StateSectionProps {
    publisher: Publisher,
    addon: Addon,
}

export const StateSection: FC<StateSectionProps> = ({ publisher, addon }) => {
    const installStates = useAppSelector(state => state.installStatus);
    const downloads = useAppSelector(state => state.downloads);

    const addonInstallState = installStates[addon.key];
    const addonDownload = downloads.find((it) => it.id === addon.key);

    if (!addonInstallState) {
        return null;
    }

    const status = addonInstallState.status;

    const isInstallingDependency = status === InstallStatus.InstallingDependency;

    let dependencyAddonDownload;
    let dependencyAddonInstallState;
    if (isInstallingDependency) {
        const dependencyAddonKey = (addonInstallState as InstallingDependencyInstallState).dependencyAddonKey;

        dependencyAddonInstallState = installStates[dependencyAddonKey];
        dependencyAddonDownload = downloads.find((it) => it.id === dependencyAddonKey);
    }

    const backgroundServiceBanner = useBackgroundServiceBanner(publisher, addon);
    const runningExternalAppBanner = useRunningExternalAppBanner(publisher, addon);
    const downloadProgressBanner = useDownloadProgressBanner(addon, dependencyAddonInstallState ?? addonInstallState, dependencyAddonDownload ?? addonDownload, isInstallingDependency);

    if (backgroundServiceBanner) {
        return backgroundServiceBanner;
    }

    if (runningExternalAppBanner) {
        return runningExternalAppBanner;
    }

    if (downloadProgressBanner) {
        return downloadProgressBanner;
    }

    return null;
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

interface ProgressBarProps {
    className: string,
    value: number,
}

const ProgressBar: FC<ProgressBarProps> = ({ className, value }) => (
    <div className="absolute left-0 -bottom-1 w-full h-2 z-10 bg-black">
        <div
            className={`absolute h-2 z-11 ${className} progress-bar-animated`}
            style={{ width: `${value}%` }}
        />
    </div>
);

const useBackgroundServiceBanner = (publisher: Publisher, addon: Addon): JSX.Element | undefined => {
    if (addon.backgroundService) {
        const isRunning = BackgroundServices.checkIsRunning(addon, publisher);

        if (isRunning) {
            return (
                <>
                    <StateContainer visible={true}>
                        <div className="flex gap-x-7 items-center">
                            <Broadcast size={32} className="text-utility-green fill-current animate-pulse" />

                            <div className="flex flex-col gap-y-2">
                                <SmallStateText>{addon.name}</SmallStateText>
                                <StateText>{`Running`}</StateText>
                            </div>
                        </div>
                    </StateContainer>

                    <ProgressBar className="bg-utility-green" value={100} />
                </>

            );
        }
    }
};

const useRunningExternalAppBanner = (publisher: Publisher, addon: Addon): JSX.Element | undefined => {
    const applicationStatus = useAppSelector(state => state.applicationStatus);

    const disallowedRunningExternalApps = addon.disallowedRunningExternalApps?.map((reference) => {
        const def = Resolver.findDefinition(reference, publisher);

        if (def.kind !== 'externalApp') {
            throw new Error(`definition (key=${def.key}) has kind=${def.kind}, expected kind=externalApp`);
        }

        return def;
    });

    for (const app of disallowedRunningExternalApps ?? []) {
        const appStatus = applicationStatus[app.key];

        if (appStatus === ApplicationStatus.Open) {
            return (
                <>
                    <StateContainer visible={true}>
                        <div className="flex gap-x-7 items-center">
                            <ExclamationTriangle size={32} className="text-utility-amber fill-current" />

                            <div className="flex flex-col gap-y-2">
                                <SmallStateText>Before installing</SmallStateText>
                                <StateText>{`Please close ${app.prettyName}`}</StateText>
                            </div>
                        </div>
                    </StateContainer>

                    <ProgressBar className="bg-utility-amber" value={100} />
                </>
            );
        }
    }
};

const useDownloadProgressBanner = (addon: Addon, installState: InstallState, download: DownloadItem, isDependency: boolean): JSX.Element | undefined => {
    if (!installState || !download) {
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

    return (
        <>
            <StateContainer visible={true}>
                <div className="flex flex-col gap-y-2">
                    <SmallStateText>Installing {isDependency ? 'Dependency' : ''}</SmallStateText>

                    {stateText}
                </div>

                {(InstallingInstallStatuses.includes(installState.status)) && (
                    <div
                        className="text-white font-semibold"
                        style={{ fontSize: "38px" }}
                    >
                        {download.progress}%
                    </div>
                )}

                <ProgressBar className="bg-cyan" value={download.progress} />
            </StateContainer>
        </>
    );
};
