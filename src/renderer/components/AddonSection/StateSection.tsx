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
import { Activity, ExclamationTriangle } from "react-bootstrap-icons";
import { Resolver } from "renderer/utils/Resolver";
import { BackgroundServices } from "renderer/utils/BackgroundServices";
import { Button, ButtonType } from "renderer/components/Button";
import { AlertModal, PromptModal, useModals } from "renderer/components/Modal";
import { Toggle } from "renderer/components/Toggle";

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

    const backgroundServiceBanner = useBackgroundServiceBanner(publisher, addon, addonInstallState);
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

const useBackgroundServiceBanner = (publisher: Publisher, addon: Addon, installState: InstallState): JSX.Element | undefined => {
    const { showModalAsync } = useModals();

    if (addon.backgroundService && InstalledInstallStatuses.includes(installState.status)) {
        const isRunning = BackgroundServices.checkIsRunning(addon, publisher);

        const bgAccentColor = isRunning ? 'bg-utility-green' : 'bg-gray-500';

        const handleClickAutostart = () => {
            // let md = '';
            // md += `You can choose to automatically start **${addon.name}** at login.\n\n`;
            // md += `You can re-configure this again later.`;

            showModalAsync(
                <AlertModal title={"Autostart Configuration"} bodyText={(
                    <>
                        <YesNoOptionToggle onToggle={() => {}} enabled={true} downloadSize="250" />
                    </>
                )} />,
            );
        };

        const handleStop = async () => {
            const md = `Are you sure you want to shut down **${addon.name}**?. All related functionality will no longer be available.`;

            const doStop = await showModalAsync(
                <PromptModal title={"Are you sure?"} bodyText={md} confirmColor={ButtonType.Danger} />,
            );

            if (doStop) {
                alert('bruh');
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
                        <span className="text-3xl text-quasi-white hover:text-cyan cursor-pointer" onClick={handleClickAutostart}>Autostart...</span>

                        <Button className="w-64" type={ButtonType.Neutral} onClick={handleStop}>{isRunning ? 'Stop' : 'Start'}</Button>
                    </div>
                </StateContainer>

                <ProgressBar className={bgAccentColor} value={100} animated={isRunning} />
            </>

        );
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

interface YesNoOptionToggleProps {
    enabled: boolean,
    onToggle: () => void
    downloadSize?: string,
}

export const YesNoOptionToggle: FC<YesNoOptionToggleProps> = ({ enabled, onToggle, downloadSize }) => {
    const handleClick = onToggle;

    const bgColor = enabled ? 'bg-utility-green' : 'bg-navy-light';
    const titleColor = enabled ? 'text-navy' : 'text-quasi-white';

    return (
        <div className={`flex items-center gap-x-10 ${bgColor} px-10 py-12 rounded-md transition-color duration-200 cursor-pointer`} onClick={handleClick}>
            <Toggle value={enabled} onToggle={handleClick} scale={1.5} onColor={'bg-utility-green'} />

            <span className="flex gap-x-20">
                <span className={`font-manrope font-bold text-4xl ${titleColor}`}>Terrain Database</span>
                {downloadSize && (
                    <span className={`font-manrope font-semibold text-4xl ${titleColor}`}>{downloadSize}</span>
                )}
            </span>
        </div>
    );
};
