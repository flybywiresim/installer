import React from "react";
import { Addon, AddonTrack } from "renderer/utils/InstallerConfiguration";
import { PromptModal } from "renderer/components/Modal";
import { Box } from "react-bootstrap-icons";
import { ButtonType } from "renderer/components/Button";
import { deleteDownload, registerNewDownload, updateDownloadProgress } from "renderer/redux/features/downloads";
import { Directories } from "renderer/utils/Directories";
import fs from "fs-extra";
import { InstallStatus } from "renderer/components/AddonSection/Enums";
import { FragmenterInstaller, needsUpdate } from "@flybywiresim/fragmenter";
import settings from "common/settings";
import { store } from "renderer/redux/store";
import { setInstallStatus } from "renderer/redux/features/installStatus";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { setInstalledTrack } from "renderer/redux/features/installedTrack";
import path from "path";

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

    static async determineAddonInstallStatus(addon: Addon): Promise<InstallStatus> {
        const addonSelectedTrack = this.getAddonSelectedTrack(addon);
        const addonInstalledTrack = this.getAddonInstalledTrack(addon);

        if (!addonSelectedTrack) {
            return InstallStatus.Unknown;
        }

        console.log("Checking install status");

        const installDir = Directories.inCommunity(addon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            return InstallStatus.NotInstalled;
        }

        console.log("Checking for git install");
        if (Directories.isGitInstall(installDir)) {
            return InstallStatus.GitInstall;
        }

        try {
            const updateInfo = await needsUpdate(addonSelectedTrack.url, installDir, {
                forceCacheBust: true,
            });
            console.log("Update info", updateInfo);

            if (addonSelectedTrack !== addonInstalledTrack && addonInstalledTrack) {
                return InstallStatus.TrackSwitch;
            }
            if (updateInfo.isFreshInstall) {
                return InstallStatus.NotInstalled;
            }

            if (updateInfo.needsUpdate) {
                return InstallStatus.NeedsUpdate;
            }

            return InstallStatus.UpToDate;
        } catch (e) {
            console.error(e);
            return InstallStatus.Unknown;
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

    private static setCurrentInstallStatus(addon: Addon, installStatus: InstallStatus): void {
        store.dispatch(setInstallStatus({ addonKey: addon.key, installStatus }));
    }

    private static setCurrentSelectedTrack(addon: Addon, track: AddonTrack): void {
        store.dispatch(setSelectedTrack({ addonKey: addon.key, track: track }));
    }

    private static setCurrentlyInstalledTrack(addon: Addon, track: AddonTrack): void {
        store.dispatch(setInstalledTrack({ addonKey: addon.key, installedTrack: track }));
    }

    static async installAddon(addon: Addon, showModal: (modal: any) => Promise<boolean>): Promise<void> {
        const configuration = store.getState().configuration;

        const track = this.getAddonSelectedTrack(addon);

        // Find dependencies
        for (const dependency of addon.dependencies ?? []) {
            const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

            const publisher = configuration.publishers.find((it) => it.key === publisherKey);
            const dependencyAddon = publisher?.addons?.find((it) => it.key === addonKey);

            if (!dependencyAddon) {
                throw new Error(`Addon specified dependency for unknown addon: @${publisherKey}/${addonKey}`);
            }

            if (dependency.optional) {
                const doInstallDependency = await showModal(
                    <PromptModal
                        title="Dependency"
                        bodyText={(
                            <>
                                <p>
                                    <b>{dependencyAddon.name}</b>
                                    {' '}
                                    by
                                    {' '}
                                    <b>{publisher.name}</b>
                                    {' '}
                                    needs to be installed to use the full functionality of
                                    {' '}
                                    <b>{addon.name}</b>
                        .
                                </p>

                                <div className="flex items-center gap-x-7 bg-navy px-7 py-6 rounded-md my-6">
                                    <Box size={36} />

                                    <div className="flex flex-col gap-y-2">
                                        <span className="text-3xl font-medium">{publisher.name}</span>
                                        <span className="text-4xl font-semibold">{dependencyAddon.name}</span>
                                    </div>
                                </div>

                                <p>{dependency.modalText}</p>
                            </>
                        )}
                        cancelText="No"
                        confirmText="Yes"
                        confirmColor={ButtonType.Positive}
                    />,
                );

                if (doInstallDependency) {
                    this.setCurrentInstallStatus(addon, InstallStatus.InstallingDependency);

                    await this.installAddon(dependencyAddon, showModal);
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

        console.log("Installing", track);
        console.log("Installing into", installDir, "using temp dir", tempDir);

        // Prepare temporary directory
        fs.removeSync(tempDir);
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        console.log("Checking for existing install");
        if (Directories.isFragmenterInstall(installDir)) {
            this.setCurrentInstallStatus(addon, InstallStatus.DownloadPrep);
            console.log("Found existing install at", installDir);
            console.log("Copying existing install to", tempDir);
            await fs.copy(installDir, tempDir);
            console.log("Finished copying");
        }

        try {
            let lastPercent = 0;
            this.setCurrentInstallStatus(addon, InstallStatus.Downloading);

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on("downloadStarted", (module) => {
                console.log("Downloading started for module", module.name);
                this.setCurrentInstallStatus(addon, InstallStatus.Downloading);
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
                this.setCurrentInstallStatus(addon, InstallStatus.Decompressing);
            });
            installer.on("retryScheduled", (module, retryCount, waitSeconds) => {
                console.log("Scheduling a retry for module", module.name);
                console.log("Retry count", retryCount);
                console.log("Waiting for", waitSeconds, "seconds");

                this.setCurrentInstallStatus(addon, InstallStatus.DownloadRetry);
            });
            installer.on("retryStarted", (module, retryCount) => {
                console.log("Starting a retry for module", module.name);
                console.log("Retry count", retryCount);

                this.setCurrentInstallStatus(addon, InstallStatus.Downloading);
            });

            console.log("Starting fragmenter download for URL", track.url);
            const installResult = await installer.install(signal, {
                forceCacheBust: !(settings.get("mainSettings.useCdnCache") as boolean),
                forceFreshInstall: false,
                forceManifestCacheBust: true,
            });
            console.log("Fragmenter download finished for URL", track.url);

            // Copy files from temp dir
            this.setCurrentInstallStatus(addon, InstallStatus.DownloadEnding);
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
            this.setCurrentInstallStatus(addon, InstallStatus.DownloadDone);

            console.log("Finished download", installResult);
        } catch (e) {
            if (signal.aborted) {
                this.setCurrentInstallStatus(addon, InstallStatus.DownloadCanceled);
            } else {
                console.error(e);
                this.setCurrentInstallStatus(addon, InstallStatus.DownloadError);
                this.notifyDownload(addon, false);
            }

            setTimeout(async () => this.setCurrentInstallStatus(addon, await this.determineAddonInstallStatus(addon)), 3_000);
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
