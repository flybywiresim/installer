import React from "react";
import { Addon, AddonTrack, Publisher } from "renderer/utils/InstallerConfiguration";
import { PromptModal } from "renderer/components/Modal";
import { ButtonType } from "renderer/components/Button";
import { deleteDownload, registerNewDownload, updateDownloadProgress } from "renderer/redux/features/downloads";
import { Directories } from "renderer/utils/Directories";
import fs from "fs-extra";
import { ApplicationStatus, InstallStatus } from "renderer/components/AddonSection/Enums";
import { FragmenterInstallerEvents, FragmenterUpdateChecker } from "@flybywiresim/fragmenter";
import settings from "common/settings";
import { store } from "renderer/redux/store";
import { InstallState, setInstallStatus } from "renderer/redux/features/installStatus";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { setInstalledTrack } from "renderer/redux/features/installedTrack";
import path from "path";
import { DependencyDialogBody } from "renderer/components/Modal/DependencyDialog";
import { Resolver } from "renderer/utils/Resolver";
import { AutostartDialog } from "renderer/components/Modal/AutostartDialog";
import { BackgroundServices } from "renderer/utils/BackgroundServices";
import { CannotInstallDialog } from "renderer/components/Modal/CannotInstallDialog";
import { ExternalApps } from "renderer/utils/ExternalApps";
import { ExternalAppsUI } from "./ExternalAppsUI";
import { ipcRenderer } from "electron";
import channels from 'common/channels';
import { InstallSizeDialog } from "renderer/components/Modal/InstallSizeDialog";
import checkDiskSpace from "check-disk-space";

type FragmenterEventArguments<K extends keyof FragmenterInstallerEvents> = Parameters<FragmenterInstallerEvents[K]>

export enum InstallResult {
    Success,
    Failure,
    Cancelled,
}

export class InstallManager {
    private static abortControllers = (() => {
        const arr = new Array<AbortController>(20);

        arr.fill(new AbortController);

        return arr;
    })();

    private static lowestAvailableAbortControllerID(): number {
        for (let i = 0; i < this.abortControllers.length; i++) {
            if (!store.getState().downloads.map(download => download.abortControllerID).includes(i)) {
                return i;
            }
        }
    }

    static async determineAddonInstallState(addon: Addon): Promise<InstallState> {
        const addonSelectedTrack = this.getAddonSelectedTrack(addon);
        const addonInstalledTrack = this.getAddonInstalledTrack(addon);

        if (!addonSelectedTrack) {
            return { status: InstallStatus.Unknown };
        }

        console.log("Checking install status");

        const installDir = Directories.inCommunity(addon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            return { status: InstallStatus.NotInstalled };
        }

        console.log("Checking for git install");
        if (Directories.isGitInstall(installDir)) {
            return { status: InstallStatus.GitInstall };
        }

        try {
            const updateInfo = await new FragmenterUpdateChecker().needsUpdate(addonSelectedTrack.url, installDir, {
                forceCacheBust: true,
            });
            console.log("Update info", updateInfo);

            if (addonSelectedTrack !== addonInstalledTrack && addonInstalledTrack) {
                return { status: InstallStatus.TrackSwitch };
            }
            if (updateInfo.isFreshInstall) {
                return { status: InstallStatus.NotInstalled };
            }

            if (updateInfo.needsUpdate) {
                return { status: InstallStatus.NeedsUpdate };
            }

            return { status: InstallStatus.UpToDate };
        } catch (e) {
            console.error(e);
            return { status: InstallStatus.Unknown };
        }
    }

    static async getAddonInstallState(addon: Addon): Promise<InstallState> {
        try {
            return store.getState().installStatus[addon.key] as InstallState;
        } catch (e) {
            const state = await this.determineAddonInstallState(addon);
            this.setCurrentInstallState(addon, state);
            return state;
        }
    }

    static getAddonSelectedTrack(addon: Addon): AddonTrack {
        try {
            return store.getState().selectedTracks[addon.key] as AddonTrack;
        } catch (e) {
            this.setCurrentSelectedTrack(addon, null);
            return null;
        }
    }

    static getAddonInstalledTrack(addon: Addon): AddonTrack {
        try {
            return store.getState().installedTracks[addon.key] as AddonTrack;
        } catch (e) {
            this.setCurrentlyInstalledTrack(addon, null);
            return null;
        }
    }

    private static setCurrentInstallState(addon: Addon, installState: InstallState): void {
        store.dispatch(setInstallStatus({ addonKey: addon.key, installState }));
    }

    private static setCurrentSelectedTrack(addon: Addon, track: AddonTrack): void {
        store.dispatch(setSelectedTrack({ addonKey: addon.key, track: track }));
    }

    private static setCurrentlyInstalledTrack(addon: Addon, track: AddonTrack): void {
        store.dispatch(setInstalledTrack({ addonKey: addon.key, installedTrack: track }));
    }

    static async installAddon(addon: Addon, publisher: Publisher, showModal: (modal: JSX.Element) => Promise<boolean>, dependencyOf?: Addon): Promise<InstallResult> {
        const setErrorState = () => {
            store.dispatch(deleteDownload({ id: addon.key }));
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadError });
        };

        const setCancelledState = () => {
            store.dispatch(deleteDownload({ id: addon.key }));
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled });
        };

        const startResetStateTimer = () => {
            setTimeout(async () => this.setCurrentInstallState(addon, await this.determineAddonInstallState(addon)), 3_000);
        };

        const removeDownloadState = () => {
            store.dispatch(deleteDownload({ id: addon.key }));
        };

        const track = this.getAddonSelectedTrack(addon);

        const disallowedRunningExternalApps = ExternalApps.forAddon(addon, publisher);

        const runningExternalApps = disallowedRunningExternalApps.filter((it) => store.getState().applicationStatus[it.key] === ApplicationStatus.Open);

        if (runningExternalApps.length > 0) {
            const doInstall = await showModal(
                <CannotInstallDialog addon={addon} publisher={publisher} />,
            );

            if (!doInstall) {
                return;
            }
        }

        // Find dependencies
        for (const dependency of addon.dependencies ?? []) {
            const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

            const dependencyPublisher = Resolver.findPublisher(publisherKey);
            const dependencyAddon = Resolver.findAddon(publisherKey, addonKey);

            if (!dependencyAddon) {
                console.error(`Addon specified dependency for unknown addon: @${publisherKey}/${addonKey}`);
                return InstallResult.Failure;
            }

            const dependencyInstallState = await this.getAddonInstallState(dependencyAddon);

            const isDependencyUptoDate = dependencyInstallState.status === InstallStatus.UpToDate;
            const isDependencyNotInstalled = dependencyInstallState.status === InstallStatus.NotInstalled;

            if (!isDependencyUptoDate) {
                let doInstallDependency = true;

                if (dependency.optional && isDependencyNotInstalled) {
                    const settingString = `mainSettings.disableDependencyPrompt.${publisher.key}.${addon.key}.@${dependencyPublisher.key}/${dependencyAddon.key}`;
                    const doNotAsk = settings.get(settingString);

                    doInstallDependency = false;

                    if (!doNotAsk) {
                        doInstallDependency = await showModal(
                            <PromptModal
                                title="Dependency"
                                bodyText={
                                    <DependencyDialogBody
                                        addon={addon}
                                        dependency={dependency}
                                        dependencyAddon={dependencyAddon}
                                        dependencyPublisher={dependencyPublisher}
                                    />
                                }
                                cancelText="No"
                                confirmText="Yes"
                                confirmColor={ButtonType.Positive}
                                dontShowAgainSettingName={settingString}
                            />,
                        );
                    }

                }

                if (doInstallDependency) {
                    this.setCurrentInstallState(addon, {
                        status: InstallStatus.InstallingDependency,
                        dependencyAddonKey: dependencyAddon.key,
                        dependencyPublisherKey: dependencyPublisher.key,
                    });

                    const result = await this.installAddon(dependencyAddon, dependencyPublisher, showModal, addon);

                    if (result === InstallResult.Failure) {
                        console.error('Error while installing dependency - aborting');
                    } else if (result === InstallResult.Cancelled) {
                        console.log('Dependency install cancelled, canceling main addon too.');

                        setCancelledState();
                        startResetStateTimer();

                        return InstallResult.Cancelled;
                    } else {
                        console.log(`Dependency @${publisherKey}/${addonKey} installed successfully.`);
                    }
                }
            }
        }

        const destDir = Directories.inCommunity(addon.targetDirectory);
        const tempDir = Directories.temp();
        const restoreDir = `${Directories.temp()}-existing`;

        const fragmenterUpdateChecker = new FragmenterUpdateChecker();
        const updateInfo = await fragmenterUpdateChecker.needsUpdate(track.url, destDir);

        // Confirm download size and required disk space with user
        const requiredDiskSpace = updateInfo.requiredDiskSpace;
        const availableDiskSpace = (await checkDiskSpace(destDir)).free;

        const diskSpaceModalSettingString = `mainSettings.disableAddonDiskSpaceModal.${publisher.key}.${addon.key}`;
        const dontAsk = settings.get(diskSpaceModalSettingString);

        if (Number.isFinite(requiredDiskSpace) && (!dontAsk || requiredDiskSpace >= availableDiskSpace)) {
            const continueInstall = await showModal(<InstallSizeDialog updateInfo={updateInfo} availableDiskSpace={availableDiskSpace} dontShowAgainSettingName={diskSpaceModalSettingString} />);

            if (!continueInstall) {
                return InstallResult.Cancelled;
            }
        }

        // Initialize abort controller for downloads
        const abortControllerID = this.lowestAvailableAbortControllerID();

        this.abortControllers[abortControllerID] = new AbortController();
        const signal = this.abortControllers[abortControllerID].signal;

        store.dispatch(registerNewDownload({ id: addon.key, module: "", abortControllerID: abortControllerID }));

        const destDir = Directories.inCommunity(addon.targetDirectory);
        const tempDir = Directories.temp();
        const restoreDir = `${Directories.temp()}-existing`;

        const restoreOldInstall = async () => {
            console.log('Install failure - attempting to restore old install');

            const restoreDirExists = fs.existsSync(restoreDir);

            if (restoreDirExists) {
                console.log('Restore directory exists - Restoring old install');
                await fs.copy(restoreDir, destDir, { recursive: true });
                console.log('Finished restoring old install');
            } else {
                console.warn('Restore directory was not created - not restoring');
            }
        };

        const deleteOldInstall = async () => {
            console.log('Install success - attempting to restore old install');

            const restoreDirExists = fs.existsSync(restoreDir);

            if (restoreDirExists) {
                console.log('Restore directory exists - deleting old install');
                await fs.rm(restoreDir, { recursive: true });
                console.log('Finished deleting old install');
            } else {
                console.warn('Restore directory was not created - not deleting');
            }
        };

        if (tempDir === Directories.community()) {
            console.error('Community directory equals temp directory');
            this.notifyDownload(addon, false);
            return InstallResult.Failure;
        }

        console.log(`Installing track=${track.key}`);
        console.log("Installing into:");
        console.log('---');
        console.log(`installDir: ${destDir}`);
        console.log(`tempDir:    ${tempDir}`);
        console.log('---');

        // Copy current install to restore directory
        console.log("Checking for existing install");
        if (Directories.isFragmenterInstall(destDir)) {
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPrep });

            console.log("Found existing install at", destDir);
            console.log("Copying existing install to", restoreDir);
            await fs.copy(destDir, restoreDir, { recursive: true });
            console.log("Finished copying");
        }

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        try {
            let lastPercent = 0;
            this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });

            // Generate a random install iD to keep track of events related to our install
            const ourInstallID = Math.floor(Math.random() * 1_000_000);

            const handleForwardedFragmenterEvent = (_: unknown, installID: number, event: keyof FragmenterInstallerEvents, ...args: unknown[]) => {
                if (installID !== ourInstallID) {
                    return;
                }

                switch (event) {
                    case 'downloadStarted': {
                        const [module] = args as FragmenterEventArguments<typeof event>;

                        console.log("Downloading started for module", module.name);

                        this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });
                        break;
                    }
                    case 'downloadProgress': {
                        const [module, progress] = args as FragmenterEventArguments<typeof event>;

                        if (lastPercent !== progress.percent) {
                            lastPercent = progress.percent;
                            store.dispatch(
                                updateDownloadProgress({
                                    id: addon.key,
                                    module: module.name,
                                    progress: {
                                        totalPercent: progress.percent,
                                        splitPartPercent: progress.partPercent,
                                        splitPartIndex: progress.partIndex,
                                        splitPartCount: progress.numParts,
                                    },
                                }));
                        }
                        break;
                    }
                    case 'unzipStarted': {
                        const [module] = args as FragmenterEventArguments<typeof event>;

                        console.log("Started unzipping module", module.name);
                        this.setCurrentInstallState(addon, { status: InstallStatus.Decompressing });

                        if (dependencyOf) {
                            this.setCurrentInstallState(dependencyOf, {
                                status: InstallStatus.InstallingDependencyEnding,
                                dependencyAddonKey: addon.key, dependencyPublisherKey: publisher.key,
                            });
                        }
                        break;
                    }
                    case 'retryScheduled': {
                        const [module, retryCount, waitSeconds] = args as FragmenterEventArguments<typeof event>;

                        console.log("Scheduling a retry for module", module.name);
                        console.log("Retry count", retryCount);
                        console.log("Waiting for", waitSeconds, "seconds");

                        this.setCurrentInstallState(addon, { status: InstallStatus.DownloadRetry });
                        break;
                    }
                    case 'retryStarted': {
                        const [module, retryCount] = args as FragmenterEventArguments<typeof event>;

                        console.log("Starting a retry for module", module.name);
                        console.log("Retry count", retryCount);

                        this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });
                        break;
                    }
                    case 'error': {
                        const [error] = args as FragmenterEventArguments<typeof event>;

                        console.error('Error from Fragmenter:', error);
                        Sentry.captureException(error);
                    }
                }
            };

            // Listen to forwarded fragmenter events
            ipcRenderer.on(channels.installManager.fragmenterEvent, handleForwardedFragmenterEvent);

            // Send cancel message when abort controller is aborted
            this.abortControllers[abortControllerID].signal.addEventListener('abort', () => {
                ipcRenderer.send(channels.installManager.cancelInstall, ourInstallID);
            });

            console.log("Starting fragmenter download for URL", track.url);

            const installResult = await ipcRenderer.invoke(channels.installManager.installFromUrl, ourInstallID, track.url, tempDir, destDir);

            // Throw any error so we can display the error dialog
            if (typeof installResult === 'object') {
                throw installResult;
            }

            console.log("Fragmenter download finished for URL", track.url);

            // Stop listening to forwarded fragmenter events
            ipcRenderer.removeListener(channels.installManager.fragmenterEvent, handleForwardedFragmenterEvent);

            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadEnding });

            // Remove installs existing under alternative names
            console.log("Removing installs existing under alternative names");
            Directories.removeAlternativesForAddon(addon);
            console.log("Finished removing installs existing under alternative names");

            this.notifyDownload(addon, true);

            // Flash completion text
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadDone });
            this.setCurrentlyInstalledTrack(addon, track);

            // If we have a background service, ask if we want to enable it
            if (addon.backgroundService && (addon.backgroundService.enableAutostartConfiguration ?? true)) {
                const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

                const isAutoStartEnabled = await BackgroundServices.isAutoStartEnabled(addon);
                const doNotAskAgain = settings.get<string, boolean>(`mainSettings.disableBackgroundServiceAutoStartPrompt.${publisher.key}.${addon.key}`);

                if (!isAutoStartEnabled && !doNotAskAgain) {
                    await showModal(
                        <AutostartDialog app={app} addon={addon} publisher={publisher} isPrompted={true} />,
                    );
                }
            }
        } catch (e) {
            if (signal.aborted) {
                console.warn('Download was cancelled');

                setCancelledState();
                startResetStateTimer();

                await restoreOldInstall();

                return InstallResult.Cancelled;
            } else {
                console.error('Download failed, see exception below');
                console.error(e);

                setErrorState();
                startResetStateTimer();

                await restoreOldInstall();

                return InstallResult.Failure;
            }
        }

        await deleteOldInstall();

        removeDownloadState();

        return InstallResult.Success;
    }

    static cancelDownload(addon: Addon): void {
        let download = store.getState().downloads.find((it) => it.id === addon.key);
        if (!download) {
            for (const dependency of addon.dependencies ?? []) {
                const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

                const dependencyAddon = Resolver.findAddon(publisherKey, addonKey);

                const dependencyDownload = store.getState().downloads.find((it) => it.id === dependencyAddon.key);

                if (dependencyDownload) {
                    download = dependencyDownload;
                }
            }
        }

        if (!download) {
            throw new Error('Cannot cancel when no addon or dependency download is ongoing');
        }

        const abortController = this.abortControllers[download.abortControllerID];

        abortController?.abort();
    }

    static async uninstallAddon(addon: Addon, publisher: Publisher, showModal: (modal: JSX.Element) => Promise<boolean>): Promise<void> {
        const doUninstall = await showModal(
            <PromptModal
                title='Are you sure?'
                bodyText={`You are about to uninstall the addon **${addon.name}**. You cannot undo this, except by reinstalling.`}
                confirmColor={ButtonType.Danger}
            />,
        );

        if (!doUninstall) {
            return;
        }

        // Make sure no disallowed external apps are running
        const noExternalAppsRunning = await ExternalAppsUI.ensureNoneRunningForAddon(addon, publisher, showModal);

        if (!noExternalAppsRunning) {
            return;
        }

        // Remove autostart of the background service if the addon has one
        if (addon.backgroundService && (addon.backgroundService.enableAutostartConfiguration ?? true)) {
            await BackgroundServices.setAutoStartEnabled(addon, publisher, false);
        }

        const installDir = Directories.inCommunity(addon.targetDirectory);

        await ipcRenderer.invoke(
            channels.installManager.uninstall,
            installDir,
            [
                Directories.inPackagesMicrosoftStore(addon.targetDirectory),
                Directories.inPackagesSteam(addon.targetDirectory),
            ],
        );

        this.setCurrentInstallState(addon, { status: InstallStatus.NotInstalled });
        this.setCurrentlyInstalledTrack(addon, null);
    }

    private static notifyDownload(addon: Addon, successful: boolean): void {
        console.log("Requesting notification");
        Notification.requestPermission()
            .then(() => {
                console.log("Showing notification");
                if (successful) {
                    new Notification(`${addon.name} download complete!`, {
                        icon: path.join(
                            process.resourcesPath,
                            "extraResources",
                            "icon.ico",
                        ),
                        body: "Take to the skies!",
                    });
                } else {
                    new Notification("Download failed!", {
                        icon: path.join(
                            process.resourcesPath,
                            "extraResources",
                            "icon.ico",
                        ),
                        body: "Oops, something went wrong",
                    });
                }
            })
            .catch((e) => console.log(e));
    }
}
