import React from "react";
import { Addon, AddonTrack, Publisher } from "renderer/utils/InstallerConfiguration";
import { PromptModal } from "renderer/components/Modal";
import { ButtonType } from "renderer/components/Button";
import { deleteDownload, registerNewDownload, updateDownloadProgress } from "renderer/redux/features/downloads";
import { Directories } from "renderer/utils/Directories";
import fs from "fs-extra";
import { InstallStatus } from "renderer/components/AddonSection/Enums";
import { FragmenterInstaller, needsUpdate } from "@flybywiresim/fragmenter";
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
            const updateInfo = await needsUpdate(addonSelectedTrack.url, installDir, {
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

    static async installAddon(addon: Addon, publisher: Publisher, showModal: (modal: any) => Promise<boolean>): Promise<InstallResult> {
        const track = this.getAddonSelectedTrack(addon);

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
                        />,
                    );
                }

                if (doInstallDependency) {
                    this.setCurrentInstallState(addon, {
                        status: InstallStatus.InstallingDependency,
                        dependencyAddonKey: dependencyAddon.key,
                        dependencyPublisherKey: dependencyPublisher.key,
                    });

                    const result = await this.installAddon(dependencyAddon, dependencyPublisher, showModal);

                    if (result === InstallResult.Failure) {
                        console.error('Error while installing dependency - aborting');
                    } else if (result === InstallResult.Cancelled) {
                        console.log('Dependency install cancelled, canceling main addon too.');
                        return;
                    } else {
                        console.log(`Dependency @${publisherKey}/${addonKey} installed successfully.`);
                    }
                }
            }
        }

        // Initialize abort controller for downloads
        const abortControllerID = this.lowestAvailableAbortControllerID();

        this.abortControllers[abortControllerID] = new AbortController;
        const signal = this.abortControllers[abortControllerID].signal;

        store.dispatch(registerNewDownload({ id: addon.key, module: "", abortControllerID: abortControllerID }));

        const installDir = Directories.inCommunity(addon.targetDirectory);
        const tempDir = Directories.temp();

        console.log(`Installing track=${track.key}`);
        console.log("Installing into:");
        console.log('---');
        console.log(`installDir: ${installDir}`);
        console.log(`tempDir:    ${tempDir}`);
        console.log('---');

        // Prepare temporary directory
        fs.removeSync(tempDir);
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        console.log("Checking for existing install");
        if (Directories.isFragmenterInstall(installDir)) {
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPrep });
            console.log("Found existing install at", installDir);
            console.log("Copying existing install to", tempDir);
            await fs.copy(installDir, tempDir);
            console.log("Finished copying");
        }

        try {
            let lastPercent = 0;
            this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on("downloadStarted", (module) => {
                console.log("Downloading started for module", module.name);
                this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });
            });
            installer.on("downloadProgress", (module, progress) => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    store.dispatch(
                        updateDownloadProgress({
                            id: addon.key,
                            module: module.name,
                            progress: progress.percent,
                        }));
                }
            });
            installer.on("unzipStarted", (module) => {
                console.log("Started unzipping module", module.name);
                this.setCurrentInstallState(addon, { status: InstallStatus.Decompressing });
            });
            installer.on("retryScheduled", (module, retryCount, waitSeconds) => {
                console.log("Scheduling a retry for module", module.name);
                console.log("Retry count", retryCount);
                console.log("Waiting for", waitSeconds, "seconds");

                this.setCurrentInstallState(addon, { status: InstallStatus.DownloadRetry });
            });
            installer.on("retryStarted", (module, retryCount) => {
                console.log("Starting a retry for module", module.name);
                console.log("Retry count", retryCount);

                this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });
            });

            console.log("Starting fragmenter download for URL", track.url);
            const installResult = await installer.install(signal, {
                forceCacheBust: !(settings.get("mainSettings.useCdnCache") as boolean),
                forceFreshInstall: false,
                forceManifestCacheBust: true,
            });
            console.log("Fragmenter download finished for URL", track.url);

            // Copy files from temp dir
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadEnding });
            Directories.removeTargetForAddon(addon);
            console.log("Copying files from", tempDir, "to", installDir);
            await fs.copy(tempDir, installDir, { recursive: true });
            console.log("Finished copying files from", tempDir, "to", installDir);

            // Remove installs existing under alternative names
            console.log("Removing installs existing under alternative names");
            Directories.removeAlternativesForAddon(addon);
            console.log(
                "Finished removing installs existing under alternative names",
            );

            store.dispatch(deleteDownload({ id: addon.key }));
            this.notifyDownload(addon, true);

            // Flash completion text
            this.setCurrentlyInstalledTrack(addon, track);
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadDone });

            console.log(`Finished download, result=${JSON.stringify(installResult)}`);

            // If we have a background service, ask if we want to enable it
            if (addon.backgroundService) {
                const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

                const isAutoStartEnabled = await BackgroundServices.isAutoStartEnabled(addon, publisher);
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
                this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled });
            } else {
                console.error('Download failed, see exception below');
                console.error(e);
                this.setCurrentInstallState(addon, { status: InstallStatus.DownloadError });
                this.notifyDownload(addon, false);
            }

            setTimeout(async () => this.setCurrentInstallState(addon, await this.determineAddonInstallState(addon)), 3_000);
        }

        store.dispatch(deleteDownload({ id: addon.key }));

        // Clean up temp dir
        fs.removeSync(tempDir);
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
