import React, { FC } from "react";
import {
    ApplicationStatus,
    InstalledInstallStatuses,
    InstallingInstallStatuses,
    InstallStatus,
} from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { InstallingDependencyInstallState, InstallState } from "renderer/redux/features/installStatus";
import { DownloadItem } from "renderer/redux/types";
import { Activity, ExclamationTriangle, Gear } from "react-bootstrap-icons";
import { Resolver } from "renderer/utils/Resolver";
import { BackgroundServices } from "renderer/utils/BackgroundServices";
import { Button, ButtonType } from "renderer/components/Button";
import { PromptModal, useModals } from "renderer/components/Modal";
import { AutostartDialog } from "renderer/components/Modal/AutostartDialog";

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

    return (
        <>
            <BackgroundServiceBanner publisher={publisher} addon={addon} installState={dependencyAddonInstallState ?? addonInstallState} />
            <RunningExternalAppBanner publisher={publisher} addon={addon} />
            <DownloadProgressBanner installState={dependencyAddonInstallState ?? addonInstallState} download={dependencyAddonDownload ?? addonDownload} isDependency={isInstallingDependency} />
        </>
    );
};

const StateContainer: FC<{ visible: boolean }> = ({ visible, children }) => {
    return (
        <div
            className="absolute h-32 bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full bg-navy-dark bg-opacity-95"
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
    animated?: boolean,
}

const ProgressBar: FC<ProgressBarProps> = ({ className, value, animated = true }) => (
    <div className="absolute left-0 -bottom-1 w-full h-2 z-10 bg-black">
        <div
            className={`absolute h-2 z-11 ${className} ${animated ? 'progress-bar-animated' : ''}`}
            style={{ width: `${value}%` }}
        />
    </div>
);

interface BackgroundServiceBannerProps {
    publisher: Publisher,
    addon: Addon,
    installState: InstallState,
}

const BackgroundServiceBanner: FC<BackgroundServiceBannerProps> = ({ publisher, addon, installState }) => {
    const { showModal, showModalAsync } = useModals();

    if (addon.backgroundService && InstalledInstallStatuses.includes(installState.status)) {
        const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

        const isRunning = BackgroundServices.isRunning(addon, publisher);

        const bgAccentColor = isRunning ? 'bg-utility-green' : 'bg-gray-500';

        const handleClickAutostart = () => showModal(
            <AutostartDialog app={app} addon={addon} publisher={publisher} isPrompted={false} />,
        );

        const handleStartStop = async () => {
            if (isRunning) {
                const md = `Are you sure you want to shut down **${addon.name}**?. All related functionality will no longer be available.`;

                const doStop = await showModalAsync(
                    <PromptModal title={"Are you sure?"} bodyText={md} confirmColor={ButtonType.Danger} />,
                );

                if (doStop) {
                    await BackgroundServices.kill(addon, publisher);
                }
            } else {
                await BackgroundServices.start(addon);
            }
        };

        return (
            <>
                <StateContainer visible={true}>
                    <div className="flex gap-x-7 items-center">
                        {
                            isRunning ? (
                                <Activity size={32} className={`text-utility-green fill-current animate-pulse`} />
                            ) : (
                                <Activity size={32} className={`text-gray-500 fill-current`} />
                            )
                        }

                        <div className="flex flex-col gap-y-2">
                            <SmallStateText>{addon.name}</SmallStateText>
                            <StateText>{isRunning ? 'Running' : 'Not Running'}</StateText>
                        </div>
                    </div>

                    <div className="flex gap-x-14 items-center">
                        <span className="flex items-center gap-x-3.5 text-3xl text-quasi-white hover:text-cyan cursor-pointer" onClick={handleClickAutostart}>
                            <Gear size={22} />
                            Autostart...
                        </span>

                        <Button className="w-64" type={ButtonType.Neutral} onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start'}</Button>
                    </div>
                </StateContainer>

                <ProgressBar className={bgAccentColor} value={100} animated={isRunning} />
            </>

        );
    }

    return null;
};

interface RunningExternalAppBannerProps {
    publisher: Publisher,
    addon: Addon,
}

const RunningExternalAppBanner: FC<RunningExternalAppBannerProps> = ({ publisher, addon }) => {
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

    return null;
};

interface DownloadProgressBannerProps {
    installState: InstallState,
    download: DownloadItem,
    isDependency: boolean,
}

const DownloadProgressBanner: FC<DownloadProgressBannerProps> = ({ installState, download, isDependency }) => {
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
