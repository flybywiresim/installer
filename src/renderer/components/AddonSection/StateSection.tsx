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

    const isInstallingDependency = InstallStatusCategories.installingDependency.includes(status);

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
            <DownloadProgressBanner addon={addon} installState={dependencyAddonInstallState ?? addonInstallState} download={dependencyAddonDownload ?? addonDownload} isDependency={isInstallingDependency} />
        </>
    );
};

const StateContainer: FC = ({ children }) => (
    <div
        className="h-32 bottom-0 left-0 flex flex-row items-center justify-between px-6 pt-6 pb-5 w-full bg-navy-dark bg-opacity-95">
        {children}
    </div>
);

const SmallStateText: FC = ({ children }) => (
    <div className="text-white text-2xl font-bold">{children}</div>
);

const StateText: FC = ({ children }) => (
    <div className="text-gray-300 text-4xl font-medium">{children}</div>
);

interface ProgressBarProps {
    className: string,
    value: number,
    animated?: boolean,
}

const ProgressBar: FC<ProgressBarProps> = ({ className, value }) => (
    <div className="w-full h-2 z-10 bg-black">
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

const BackgroundServiceBanner: FC<BackgroundServiceBannerProps> = ({ publisher, addon, installState }) => {
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
            <div className="flex-grow" style={{ flexGrow: 10 }}>
                <StateContainer>
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
                        {(addon.backgroundService.enableAutostartConfiguration ?? true) && (
                            <span className="flex items-center gap-x-3.5 text-3xl text-quasi-white hover:text-cyan cursor-pointer" onClick={handleClickAutostart}>
                                <Gear size={22} />
                                Autostart...
                            </span>
                        )}

                        <Button className="w-64" type={ButtonType.Neutral} onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start'}</Button>
                    </div>
                </StateContainer>

                <ProgressBar className={bgAccentColor} value={100} animated={isRunning} />
            </div>

        );
    }

    return null;
};

interface DownloadProgressBannerProps {
    addon: Addon,
    installState: InstallState,
    download: DownloadItem,
    isDependency: boolean,
}

const DownloadProgressBanner: FC<DownloadProgressBannerProps> = ({ addon, installState, download, isDependency }) => {
    if (!installState || !download) {
        return null;
    }

    let stateIcon;
    let stateText;
    let progressBarBg;
    let progressBarValue;
    switch (installState.status) {
        case InstallStatus.DownloadPrep:
            stateIcon = <Download size={40} className="text-white mr-6" />;
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

                stateIcon = <Download size={40} className="text-white mr-6" />;
                stateText = <SmallStateText>{`Downloading`}{part}</SmallStateText>;
                progressBarBg = 'bg-cyan';
            }

            progressBarValue = Number.isFinite(download.progress.totalPercent) ? download.progress.totalPercent : download.progress.splitPartPercent;

            break;
        }
        case InstallStatus.Decompressing:
        case InstallStatus.InstallingDependencyEnding:
            stateIcon = <Download size={40} className="text-white mr-6"/>;
            stateText = <SmallStateText>Decompressing</SmallStateText>;
            progressBarBg = 'bg-cyan';
            progressBarValue = installState.percent;
            break;
        case InstallStatus.DownloadEnding:
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
            stateIcon = <Stopwatch size={40} className="text-white mr-6"/>;
            stateText = <SmallStateText>Retrying {download?.module.toLowerCase()} module</SmallStateText>;
            progressBarBg = 'bg-utility-amber';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadError:
            stateText = <SmallStateText>Failed to install</SmallStateText>;
            progressBarBg = 'bg-utility-red';
            progressBarValue = 100;
            break;
        case InstallStatus.DownloadCanceled:
            stateIcon = <XOctagon size={40} className="text-white mr-6"/>;
            stateText = <SmallStateText>Download canceled</SmallStateText>;
            progressBarBg = 'bg-utility-amber';
            progressBarValue = 100;
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

    const showProgress = InstallStatusCategories.installing.includes(installState.status) && !(InstallStatusCategories.installingNoProgress.includes(installState.status));

    // let smallStateText;
    // if (installState.status === InstallStatus.Downloading && download?.progress.interrupted) {
    //     smallStateText = <SmallStateText>Waiting for network connection</SmallStateText>;
    // } else if (isDependency) {
    //     smallStateText = <SmallStateText>Installing dependency</SmallStateText>;
    // } else {
    //     smallStateText = <SmallStateText>Installing</SmallStateText>;
    // }

    let moduleStateText;
    if (download.module && installState.status !== InstallStatus.DownloadCanceled) {
        const moduleIndicator = showProgress && download.moduleCount > 1 ? <span className=" text-gray-400">{download.moduleIndex + 1}/{download.moduleCount}</span> : null;

        moduleStateText = (
            <span className="flex items-center gap-x-3 mr-12 text-white text-4xl">
                {moduleIndicator}

                <span className="flex items-center gap-x-4">
                    <span>{download.module === 'full' ? 'Full package' : download.module}</span>
                </span>
            </span>
        );
    } else {
        moduleStateText = (
            <span className="flex items-center gap-x-3 mr-12 text-white text-4xl">
                <span className="flex items-center gap-x-4">
                    {addon.name}
                </span>
            </span>
        );
    }

    return (
        <div className="flex-grow" style={{ flexGrow: 10 }}>
            <StateContainer>
                <span className="flex items-center">
                    {stateIcon}

                    <div className="w-0.5 h-20 mr-6 bg-gray-700"></div>

                    <div className="flex items-center gap-x-12">
                        <div className="flex flex-col gap-y-2">
                            {moduleStateText}
                            {stateText}
                        </div>
                    </div>
                </span>

                {showProgress && (
                    <span className="flex items-center text-white">
                        <span
                            className="font-semibold"
                            style={{ fontSize: "38px" }}
                        >
                            {progressBarValue}%
                        </span>
                    </span>
                )}
            </StateContainer>

            <ProgressBar className={progressBarBg} value={progressBarValue} />
        </div>
    );
};
