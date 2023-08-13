import React, { FC } from "react";
import { InstallStatus, InstallStatusCategories } from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { InstallingDependencyInstallState, InstallState } from "renderer/redux/features/installStatus";
import { DownloadItem } from "renderer/redux/types";
import { Activity, Download, Gear, Stopwatch, WifiOff, XOctagon } from "react-bootstrap-icons";
import { BackgroundServices } from "renderer/utils/BackgroundServices";
import { Button, ButtonType } from "renderer/components/Button";
import { PromptModal, useModals } from "renderer/components/Modal";
import { AutostartDialog } from "renderer/components/Modal/AutostartDialog";
import { useAddonExternalApps } from "renderer/utils/ExternalAppsUI";
import { InstallManager } from "renderer/utils/InstallManager";
import { useDataContext } from "renderer/utils/DataContext";
import { MainActionButton } from "./MainActionButton";
import { SidebarButton } from "renderer/components/AddonSection/index";

export interface StateSectionProps {
    publisher: Publisher,
    addon: Addon,
}

export const StateSection: FC<StateSectionProps> = ({ addon }) => {
    const installStates = useAppSelector(state => state.installStatus);
    const downloads = useAppSelector(state => state.downloads);

    const addonInstallState = installStates[addon.key];
    const addonDownload = downloads.find((it) => it.id === addon.key);

    if (!addonInstallState) {
        return null;
    }

    const status = addonInstallState.status;

    const isInstallingDependency = InstallStatusCategories.installingDependency.includes(status);

    let dependencyAddonDownload;
    let dependencyAddonInstallState;
    if (isInstallingDependency) {
        const dependencyAddonKey = (addonInstallState as InstallingDependencyInstallState).dependencyAddonKey;

        dependencyAddonInstallState = installStates[dependencyAddonKey];
        dependencyAddonDownload = downloads.find((it) => it.id === dependencyAddonKey);
    }

    return (
        <DownloadProgressBanner
            installState={dependencyAddonInstallState ?? addonInstallState}
            download={dependencyAddonDownload ?? addonDownload}
            isDependency={isInstallingDependency}
        />
    );
};

const SmallStateText: FC = ({ children }) => (
    <span className="text-white text-4xl font-medium">{children}</span>
);

interface ProgressBarProps {
    className: string,
    value: number,
    animated?: boolean,
}

const ProgressBar: FC<ProgressBarProps> = ({ className, value }) => (
    <div className="w-full h-2 z-10 bg-navy">
        <div
            className={`h-2 z-11 transition-all duration-75 ${className}`}
            style={{ width: `${value}%` }}
        />
        {/* FIXME animation */}
    </div>
);

interface BackgroundServiceBannerProps {
    publisher: Publisher,
    addon: Addon,
    installState: InstallState,
}

export const BackgroundServiceBanner: FC<BackgroundServiceBannerProps> = ({ publisher, addon, installState }) => {
    const { showModal, showModalAsync } = useModals();
    const [runningExternalApps] = useAddonExternalApps(addon, publisher);

    if (addon.backgroundService && InstallStatusCategories.installed.includes(installState.status)) {
        const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

        const isRunning = !!runningExternalApps.find((it) => it.key === app.key);

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
            <div className="flex flex-row justify-between items-center gap-x-7">
                {
                    isRunning ? (
                        <Activity size={32} className={`text-utility-green fill-current animate-pulse`} />
                    ) : (
                        <Activity size={32} className={`text-gray-500 fill-current`} />
                    )
                }

                <div className="flex gap-x-14 items-center">
                    {(addon.backgroundService.enableAutostartConfiguration ?? true) && (
                        <span
                            className="flex items-center gap-x-3.5 text-3xl text-quasi-white hover:text-cyan cursor-pointer"
                            onClick={handleClickAutostart}>
                            <Gear size={22} />
                                Autostart...
                        </span>
                    )}

                    <Button className="w-64" type={ButtonType.Neutral}
                        onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start'}</Button>
                </div>
            </div>

        );
    }

    return null;
};

interface DownloadProgressBannerProps {
    installState: InstallState,
    download: DownloadItem,
    isDependency: boolean,
}

const DownloadProgressBanner: FC<DownloadProgressBannerProps> = ({ installState, download }) => {
    const { showModalAsync } = useModals();

    const { publisher, addon } = useDataContext();

    // TODO dependency state

    let stateIcon;
    let stateText;
    let progressBarBg;
    let progressBarValue;
    switch (installState?.status) {
        case InstallStatus.DownloadPrep:
            stateIcon = <Download size={32} className="text-white mr-6"/>;
            stateText = <SmallStateText>Preparing update</SmallStateText>;
            progressBarBg = 'bg-cyan';
            progressBarValue = 0;
            break;
        case InstallStatus.Downloading: {
            if (download.progress.interrupted) {
                stateIcon = <WifiOff size={42} className="text-white mr-6"/>;
                stateText = <SmallStateText>{`Download interrupted`}</SmallStateText>;
                progressBarBg = 'bg-utility-red';
            } else {
                const part = Number.isFinite(download.progress.splitPartIndex) && !Number.isFinite(download.progress.totalPercent)
                    ? <span
                        className="text-gray-300 ml-3">part {download.progress.splitPartIndex + 1}/{download.progress.splitPartCount}</span>
                    : null;

                stateIcon = <Download size={32} className="text-white mr-6"/>;
                stateText = <SmallStateText>{`Downloading`}{part}</SmallStateText>;
                progressBarBg = 'bg-cyan';
            }

            progressBarValue = Number.isFinite(download.progress.totalPercent) ? download.progress.totalPercent : download.progress.splitPartPercent;

            break;
        }
        case InstallStatus.Decompressing:
        case InstallStatus.InstallingDependencyEnding:
            stateIcon = <Download size={32} className="text-white mr-6"/>;
            stateText = <SmallStateText>Decompressing</SmallStateText>;
            progressBarBg = 'bg-cyan';
            progressBarValue = installState.percent;
            break;
        case InstallStatus.DownloadEnding:
            stateIcon = <Download size={32} className="text-white mr-6"/>;
            stateText = <SmallStateText>Finishing update</SmallStateText>;
            progressBarBg = 'bg-cyan';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadDone:
            stateText = <SmallStateText>Completed!</SmallStateText>;
            progressBarBg = 'bg-cyan';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadRetry:
            stateIcon = <Stopwatch size={32} className="text-white mr-6"/>;
            stateText = <SmallStateText>Retrying {download?.module.toLowerCase()} module</SmallStateText>;
            progressBarBg = 'bg-utility-amber';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadError:
            stateIcon = <XOctagon size={40} className="text-white mr-6"/>;
            stateText = <SmallStateText>Failed to install</SmallStateText>;
            progressBarBg = 'bg-utility-red';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadCanceled:
            stateIcon = <XOctagon size={32} className="text-white mr-6"/>;
            stateText = <SmallStateText>Download canceled</SmallStateText>;
            progressBarBg = 'bg-utility-amber';
            progressBarValue = NaN;
            break;
        case InstallStatus.Unknown:
            stateText = <SmallStateText>Unknown state</SmallStateText>;
            progressBarBg = 'bg-utility-amber';
            progressBarValue = 100;
            break;
        case InstallStatus.NotInstalled:
        case InstallStatus.GitInstall:
        case InstallStatus.TrackSwitch:
        default:
            stateText = <></>;
            progressBarBg = 'bg-cyan';
            progressBarValue = 0;
            break;
    }

    const showProgress = InstallStatusCategories.installing.includes(installState?.status) && !(InstallStatusCategories.installingNoProgress.includes(installState?.status));

    // let smallStateText;
    // if (installState.status === InstallStatus.Downloading && download?.progress.interrupted) {
    //     smallStateText = <SmallStateText>Waiting for network connection</SmallStateText>;
    // } else if (isDependency) {
    //     smallStateText = <SmallStateText>Installing dependency</SmallStateText>;
    // } else {
    //     smallStateText = <SmallStateText>Installing</SmallStateText>;
    // }

    let moduleStateText;
    if (download?.module && installState?.status !== InstallStatus.DownloadCanceled && installState?.status !== InstallStatus.DownloadEnding) {
        const moduleIndicator = showProgress && download.moduleCount > 1 ?
            <span className=" text-gray-400">{download.moduleIndex + 1}/{download.moduleCount}</span> : null;

        moduleStateText = (
            <span className="flex items-center gap-x-3 mr-3 text-white text-4xl">
                {moduleIndicator}

                {/*<span className="flex items-center gap-x-4">*/}
                <span>{download.module === 'full' ? 'Full package' : download.module}</span>
                {/*</span>*/}
            </span>
        );
    } else {
        moduleStateText = (
            <span className="flex items-center gap-x-3 mr-6 text-white text-4xl">
                <span className="flex items-center gap-x-4">
                    {addon.name}
                </span>
            </span>
        );
    }

    const handleCancel = () => InstallManager.cancelDownload(addon);

    const handleInstall = () => InstallManager.installAddon(addon, publisher, showModalAsync);

    const UninstallButton = (): JSX.Element => {
        switch (installState.status) {
            case InstallStatus.UpToDate:
            case InstallStatus.NeedsUpdate:
            case InstallStatus.TrackSwitch:
            case InstallStatus.DownloadDone:
            case InstallStatus.GitInstall: {
                return (
                    <SidebarButton
                        type={ButtonType.Neutral}
                        onClick={() => InstallManager.uninstallAddon(addon, publisher, showModalAsync)}
                    >
                        Uninstall
                    </SidebarButton>
                );
            }
            default: return <></>;
        }
    };

    return (
        <div className="flex-grow" style={{ flexGrow: 10 }}>
            <ProgressBar className={progressBarBg} value={progressBarValue} />

            <span className="flex-grow flex items-center justify-between gap-x-6 py-7 px-6">
                {installState && download && (
                    <span className="flex flex-grow items-center justify-between">
                        <span className="text-4xl text-quasi-white">{Number.isFinite(progressBarValue) ? `${progressBarValue}% ` : ''}{stateText}</span>
                        <span className="text-4xl text-quasi-white ml-auto">{moduleStateText}</span>
                    </span>
                )}

                <div className="ml-auto flex gap-x-6">
                    <UninstallButton />
                    <MainActionButton installState={installState} onInstall={handleInstall} onCancel={handleCancel} />
                </div>
            </span>
        </div>
    );
};
