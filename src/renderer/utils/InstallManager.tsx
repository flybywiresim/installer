import React from 'react';
import { Addon, AddonTrack, Publisher } from 'renderer/utils/InstallerConfiguration';
import { PromptModal } from 'renderer/components/Modal';
import { ButtonType } from 'renderer/components/Button';
import {
  clearDownloadInterrupted,
  deleteDownload,
  registerNewDownload,
  setDownloadInterrupted,
  setDownloadModuleIndex,
  updateDownloadProgress,
} from 'renderer/redux/features/downloads';
import { Directories } from 'renderer/utils/Directories';
import fs from 'fs';
import { ApplicationStatus, InstallStatus, InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import {
  FragmenterContextEvents,
  FragmenterError,
  FragmenterInstallerEvents,
  FragmenterOperation,
  FragmenterUpdateChecker,
  getCurrentInstall,
  InstallManifest,
} from '@flybywiresim/fragmenter';
import settings from 'renderer/rendererSettings';
import { store } from 'renderer/redux/store';
import { InstallState, setInstallStatus } from 'renderer/redux/features/installStatus';
import { setSelectedTrack } from 'renderer/redux/features/selectedTrack';
import { setInstalledTrack } from 'renderer/redux/features/installedTrack';
import path from 'path';
import { DependencyDialogBody } from 'renderer/components/Modal/DependencyDialog';
import { IncompatibleAddonDialogBody } from 'renderer/components/Modal/IncompatibleAddonDialog';
import { Resolver } from 'renderer/utils/Resolver';
import { AutostartDialog } from 'renderer/components/Modal/AutostartDialog';
import { BackgroundServices } from 'renderer/utils/BackgroundServices';
import { CannotInstallDialog } from 'renderer/components/Modal/CannotInstallDialog';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { ExternalAppsUI } from './ExternalAppsUI';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import * as Sentry from '@sentry/electron/renderer';
import { ErrorDialog } from 'renderer/components/Modal/ErrorDialog';
import { InstallSizeDialog } from 'renderer/components/Modal/InstallSizeDialog';
import { IncompatibleAddOnsCheck } from 'renderer/utils/IncompatibleAddOnsCheck';
import { FreeDiskSpace, FreeDiskSpaceStatus } from 'renderer/utils/FreeDiskSpace';
import { setAddonAndTrackLatestReleaseInfo } from 'renderer/redux/features/latestVersionNames';
import { AddonData, ReleaseInfo } from 'renderer/utils/AddonData';

type FragmenterEventArguments<K extends keyof FragmenterInstallerEvents | keyof FragmenterContextEvents> = Parameters<
  (FragmenterInstallerEvents & FragmenterContextEvents)[K]
>;

export enum InstallResult {
  Success,
  Failure,
  Cancelled,
}

export class InstallManager {
  private static abortControllers = (() => {
    const arr = new Array<AbortController>(20);

    arr.fill(new AbortController());

    return arr;
  })();

  public static async installAddon(
    addon: Addon,
    publisher: Publisher,
    showModal: (modal: React.JSX.Element) => Promise<boolean>,
    dependencyOf?: Addon,
  ): Promise<InstallResult> {
    this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPending });

    const setErrorState = () => {
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadError });
    };

    const setCancelledState = () => {
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled, timestamp: Date.now() });
    };

    const startResetStateTimer = (timeout = 3_000) => {
      setTimeout(async () => {
        store.dispatch(deleteDownload({ id: addon.key }));
        this.setCurrentInstallState(addon, await this.determineAddonInstallStatus(addon));
      }, timeout);
    };

    const removeDownloadState = () => {
      store.dispatch(deleteDownload({ id: addon.key }));
    };

    const track = this.getAddonSelectedTrack(addon);

    const disallowedRunningExternalApps = ExternalApps.forAddon(addon, publisher);

    const runningExternalApps = disallowedRunningExternalApps.filter(
      (it) => store.getState().applicationStatus[it.key] === ApplicationStatus.Open,
    );

    if (runningExternalApps.length > 0) {
      const doInstall = await showModal(<CannotInstallDialog addon={addon} publisher={publisher} />);

      if (!doInstall) {
        startResetStateTimer(0);

        return InstallResult.Cancelled;
      }
    }

    // Find dependencies
    for (const dependency of addon.dependencies ?? []) {
      const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

      const dependencyPublisher = Resolver.findPublisher(publisherKey);
      const dependencyAddon = Resolver.findAddon(publisherKey, addonKey);

      if (!dependencyAddon) {
        console.error(
          `[InstallManager](installAddon) Addon specified dependency for unknown addon: @${publisherKey}/${addonKey}`,
        );

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
            console.error('[InstallManager](installAddon) Error while installing dependency - aborting');

            setErrorState();
            startResetStateTimer();

            return InstallResult.Failure;
          } else if (result === InstallResult.Cancelled) {
            console.log('[InstallManager](installAddon) Dependency install cancelled, canceling main addon too.');

            setCancelledState();
            startResetStateTimer();

            return InstallResult.Cancelled;
          } else {
            console.log(
              `[InstallManager](installAddon) Dependency @${publisherKey}/${addonKey} installed successfully.`,
            );
          }
        }
      }
    }

    if (addon.incompatibleAddons && addon.incompatibleAddons.length > 0) {
      const incompatibleAddons = await IncompatibleAddOnsCheck.checkIncompatibleAddOns(addon);
      if (incompatibleAddons.length > 0) {
        const continueInstall = await showModal(
          <PromptModal
            title="Incompatible Add-ons Found!"
            bodyText={<IncompatibleAddonDialogBody addon={addon} incompatibleAddons={incompatibleAddons} />}
            cancelText="No"
            confirmText="Yes"
            confirmColor={ButtonType.Positive}
          />,
        );
        if (!continueInstall) {
          startResetStateTimer();
          return InstallResult.Cancelled;
        }
      }
    }

    const destDir = Directories.inInstallLocation(addon.targetDirectory);
    const tempDir = Directories.temp();

    const fragmenterUpdateChecker = new FragmenterUpdateChecker();
    const updateInfo = await fragmenterUpdateChecker.needsUpdate(track.url, destDir, { forceCacheBust: true });

    // Confirm download size and required disk space with user
    const requiredDiskSpace = updateInfo.requiredDiskSpace;

    const freeDeskSpaceInfo = await FreeDiskSpace.analyse(requiredDiskSpace);

    const diskSpaceModalSettingString = `mainSettings.disableAddonDiskSpaceModal.${publisher.key}.${addon.key}`;
    const dontAsk = settings.get(diskSpaceModalSettingString);

    if (
      (!dontAsk || freeDeskSpaceInfo.status !== FreeDiskSpaceStatus.NotLimited) &&
      freeDeskSpaceInfo.status !== FreeDiskSpaceStatus.Unknown
    ) {
      const continueInstall = await showModal(
        <InstallSizeDialog
          updateInfo={updateInfo}
          freeDeskSpaceInfo={freeDeskSpaceInfo}
          dontShowAgainSettingName={diskSpaceModalSettingString}
        />,
      );

      if (!continueInstall) {
        startResetStateTimer();

        return InstallResult.Cancelled;
      }
    }

    // Initialize abort controller for downloads
    const abortControllerID = this.lowestAvailableAbortControllerID();

    this.abortControllers[abortControllerID] = new AbortController();
    const signal = this.abortControllers[abortControllerID].signal;

    let moduleCount = updateInfo.isFreshInstall ? 1 : updateInfo.updatedModules.length + updateInfo.addedModules.length;
    if (!updateInfo.isFreshInstall && updateInfo.baseChanged) {
      moduleCount++;
    }

    store.dispatch(
      registerNewDownload({
        id: addon.key,
        module: '',
        moduleCount,
        abortControllerID: abortControllerID,
      }),
    );

    if (tempDir === Directories.installLocation()) {
      console.error('[InstallManager](installAddon) Community directory equals temp directory');

      this.notifyDownload(addon, false);
      return InstallResult.Failure;
    }

    console.log(`[InstallManager](installAddon) Installing track=${track.key}`);
    console.log('[InstallManager](installAddon) Installing into:');
    console.log('[InstallManager](installAddon) ---');
    console.log(`[InstallManager](installAddon) installDir: ${destDir}`);
    console.log(`[InstallManager](installAddon) tempDir:    ${tempDir}`);
    console.log('[InstallManager](installAddon) ---');

    try {
      // Create dest dir if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      let lastPercent = 0;

      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPrep });

      // Generate a random install iD to keep track of events related to our install
      const ourInstallID = Math.floor(Math.random() * 1_000_000);

      const handleForwardedFragmenterEvent = (
        _: unknown,
        installID: number,
        event: keyof FragmenterInstallerEvents | keyof FragmenterContextEvents,
        ...args: unknown[]
      ) => {
        if (installID !== ourInstallID) {
          return;
        }

        switch (event) {
          case 'downloadStarted': {
            const [module] = args as FragmenterEventArguments<typeof event>;

            console.log('[InstallManager](installAddon) Downloading started for module', module.name);

            this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });

            store.dispatch(
              updateDownloadProgress({
                id: addon.key,
                module: module.name,
                progress: {
                  interrupted: false,
                  totalPercent: 0,
                  splitPartPercent: 0,
                  splitPartIndex: 0,
                  splitPartCount: 0,
                },
              }),
            );

            break;
          }
          case 'phaseChange': {
            const [phase] = args as FragmenterEventArguments<typeof event>;

            if (phase.op === FragmenterOperation.InstallFinish) {
              this.setCurrentInstallState(addon, { status: InstallStatus.DownloadEnding });
              return;
            }

            if ('moduleIndex' in phase) {
              store.dispatch(
                setDownloadModuleIndex({
                  id: addon.key,
                  moduleIndex: phase.moduleIndex,
                }),
              );
            }
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
                    interrupted: false,
                    totalPercent: progress.percent,
                    splitPartPercent: progress.partPercent,
                    splitPartIndex: progress.partIndex,
                    splitPartCount: progress.numParts,
                  },
                }),
              );
            }
            break;
          }
          case 'downloadInterrupted': {
            store.dispatch(setDownloadInterrupted({ id: addon.key }));

            break;
          }
          case 'unzipStarted': {
            const [module] = args as FragmenterEventArguments<typeof event>;

            console.log('[InstallManager](installAddon) Started unzipping module', module.name);
            this.setCurrentInstallState(addon, { status: InstallStatus.Decompressing, percent: 0 });

            if (dependencyOf) {
              this.setCurrentInstallState(dependencyOf, {
                status: InstallStatus.InstallingDependencyEnding,
                dependencyAddonKey: addon.key,
                dependencyPublisherKey: publisher.key,
                percent: 0,
              });
            }
            break;
          }
          case 'unzipProgress': {
            const [, progress] = args as FragmenterEventArguments<typeof event>;

            const percent = Math.round(((progress.entryIndex + 1) / progress.entryCount) * 100);

            this.setCurrentInstallState(addon, {
              status: InstallStatus.Decompressing,
              percent,
              entry: progress.entryName,
            });

            if (dependencyOf) {
              this.setCurrentInstallState(dependencyOf, {
                status: InstallStatus.InstallingDependencyEnding,
                dependencyAddonKey: addon.key,
                dependencyPublisherKey: publisher.key,
                percent,
              });
            }
            break;
          }
          case 'copyStarted': {
            const [module] = args as FragmenterEventArguments<typeof event>;

            console.log('[InstallManager](installAddon) Started moving over module', module.name);

            if (module.name === 'full') {
              this.setCurrentInstallState(addon, { status: InstallStatus.DownloadEnding });
            }

            break;
          }
          case 'retryScheduled': {
            const [module, retryCount, waitSeconds] = args as FragmenterEventArguments<typeof event>;

            console.log('[InstallManager](installAddon) Scheduling a retry for module', module.name);
            console.log('[InstallManager](installAddon) Retry count', retryCount);
            console.log('[InstallManager](installAddon) Waiting for', waitSeconds, 'seconds');

            store.dispatch(clearDownloadInterrupted({ id: addon.key }));

            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadRetry });
            break;
          }
          case 'retryStarted': {
            const [module, retryCount] = args as FragmenterEventArguments<typeof event>;

            console.log('[InstallManager](installAddon) Starting a retry for module', module.name);
            console.log('[InstallManager](installAddon) Retry count', retryCount);

            this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });
            break;
          }
          case 'cancelled': {
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled, timestamp: Date.now() });
            break;
          }
          case 'error': {
            const [error] = args as FragmenterEventArguments<typeof event>;

            console.error('[InstallManager](installAddon) Error from Fragmenter:', error);
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

      console.log('[InstallManager](installAddon) Starting fragmenter download for URL', track.url);

      const installResult = await ipcRenderer.invoke(
        channels.installManager.installFromUrl,
        ourInstallID,
        track.url,
        tempDir,
        destDir,
      );

      // Throw any error so we can display the error dialog
      if (typeof installResult === 'object') {
        throw installResult;
      }

      console.log('[InstallManager](installAddon) Fragmenter download finished for URL', track.url);

      // Stop listening to forwarded fragmenter events
      ipcRenderer.removeListener(channels.installManager.fragmenterEvent, handleForwardedFragmenterEvent);

      // Remove installs existing under alternative names
      console.log('[InstallManager](installAddon) Removing installs existing under alternative names');
      Directories.removeAlternativesForAddon(addon);
      console.log('[InstallManager](installAddon) Finished removing installs existing under alternative names');

      this.notifyDownload(addon, true);

      // Flash completion text
      this.setCurrentlyInstalledTrack(addon, track);
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadDone });

      // If we have a background service, ask if we want to enable it
      if (addon.backgroundService && (addon.backgroundService.enableAutostartConfiguration ?? true)) {
        const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

        const isAutoStartEnabled = await BackgroundServices.isAutoStartEnabled(addon);
        const doNotAskAgain = settings.get<string, boolean>(
          `mainSettings.disableBackgroundServiceAutoStartPrompt.${publisher.key}.${addon.key}`,
        );

        if (!isAutoStartEnabled && !doNotAskAgain) {
          await showModal(<AutostartDialog app={app} addon={addon} publisher={publisher} isPrompted={true} />);
        }
      }
    } catch (e) {
      const isFragmenterError = FragmenterError.isFragmenterError(e);

      if (signal.aborted) {
        console.warn('[InstallManager](installAddon) Download was cancelled');

        setCancelledState();
        startResetStateTimer();

        return InstallResult.Cancelled;
      } else {
        console.error('[InstallManager](installAddon) Download failed, see exception below');
        console.error(e);

        setErrorState();

        Sentry.captureException(e);
        await showModal(<ErrorDialog error={isFragmenterError ? e : FragmenterError.createFromError(e)} />);

        startResetStateTimer();

        Sentry.captureException(e);
        await showModal(<ErrorDialog error={e} />);

        return InstallResult.Failure;
      }
    }

    removeDownloadState();

    return InstallResult.Success;
  }

  public static cancelDownload(addon: Addon): void {
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
      throw new Error('[InstallManager](cancelDownload) Cannot cancel when no addon or dependency download is ongoing');
    }

    const abortController = this.abortControllers[download.abortControllerID];

    abortController?.abort();
  }

  public static async uninstallAddon(
    addon: Addon,
    publisher: Publisher,
    showModal: (modal: JSX.Element) => Promise<boolean>,
  ): Promise<void> {
    const doUninstall = await showModal(
      <PromptModal
        title="Are you sure?"
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

    const installDir = Directories.inInstallLocation(addon.targetDirectory);

    await ipcRenderer.invoke(channels.installManager.uninstall, installDir, [
      Directories.inPackages(addon.targetDirectory),
    ]);

    this.setCurrentInstallState(addon, { status: InstallStatus.NotInstalled });
    this.setCurrentlyInstalledTrack(addon, null);
  }

  private static getAddonInstall(directory: string): InstallManifest | null {
    try {
      return getCurrentInstall(directory);
    } catch (e) {
      return null;
    }
  }

  public static async getAddonInstallState(addon: Addon): Promise<InstallState> {
    const status = store.getState().installStatus[addon.key] as InstallState;

    if (status) {
      return status;
    }

    return this.refreshAddonInstallState(addon);
  }

  public static async refreshAddonInstallState(addon: Addon): Promise<InstallState> {
    const currentState = store.getState().installStatus[addon.key] as InstallState;

    if (currentState?.status === InstallStatus.DownloadCanceled) {
      setTimeout(
        async () => {
          const status = await this.determineAddonInstallStatus(addon);
          this.setCurrentInstallState(addon, status);
        },
        3_000 - (Date.now() - currentState.timestamp),
      );

      return currentState;
    }

    const status = await this.determineAddonInstallStatus(addon);
    this.setCurrentInstallState(addon, status);

    return status;
  }

  public static getAddonSelectedTrack(addon: Addon): AddonTrack {
    const selectedTrack = store.getState().selectedTracks[addon.key] as AddonTrack;

    if (selectedTrack) {
      return selectedTrack;
    }

    this.setCurrentSelectedTrack(addon, addon.tracks[0]);

    return addon.tracks[0];
  }

  public static determineAddonInstalledTrack(addon: Addon): AddonTrack | null {
    const installedTrack = store.getState().installedTracks[addon.key] as AddonTrack;

    if (installedTrack) {
      return installedTrack;
    }

    const install = this.getAddonInstall(Directories.inInstallLocation(addon.targetDirectory));

    if (!install) {
      return null;
    }

    const matchingTrack = addon.tracks.find((it) => it.url === install.source);

    if (!matchingTrack) {
      return null;
    }

    this.setCurrentlyInstalledTrack(addon, matchingTrack);
    this.setCurrentSelectedTrack(addon, matchingTrack);

    return matchingTrack;
  }

  private static lowestAvailableAbortControllerID(): number {
    for (let i = 0; i < this.abortControllers.length; i++) {
      if (
        !store
          .getState()
          .downloads.map((download) => download.abortControllerID)
          .includes(i)
      ) {
        return i;
      }
    }
  }

  private static async determineAddonInstallStatus(addon: Addon): Promise<InstallState> {
    console.log('[InstallManager](determineAddonInstallStatus) Checking install status');

    const installDir = Directories.inInstallLocation(addon.targetDirectory);
    const addonInstalledTrack = this.determineAddonInstalledTrack(addon);
    const addonSelectedTrack = this.getAddonSelectedTrack(addon);

    if (!fs.existsSync(installDir)) {
      console.log('[InstallManager](determineAddonInstallStatus) Is not installed');

      return { status: InstallStatus.NotInstalled };
    }

    console.log('[InstallManager](determineAddonInstallStatus) Checking for git install');

    if (Directories.isGitInstall(installDir)) {
      console.log('[InstallManager](determineAddonInstallStatus) Is git install');

      return { status: InstallStatus.GitInstall };
    }

    try {
      const updateInfo = await new FragmenterUpdateChecker().needsUpdate(addonSelectedTrack.url, installDir, {
        forceCacheBust: true,
      });

      console.log('[InstallManager](determineAddonInstallStatus) Update info', updateInfo);

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

  public static async checkForUpdates(addon: Addon): Promise<void> {
    console.log('[InstallManager](checkForUpdates) Checking for updates for ' + addon.key);

    const installDir = Directories.inInstallLocation(addon.targetDirectory);

    const state = store.getState();

    const addonInstallState = state.installStatus[addon.key] ?? { status: InstallStatus.Unknown };

    if (
      InstallStatusCategories.installing.includes(addonInstallState.status) ||
      addonInstallState.status === InstallStatus.Unknown
    ) {
      return;
    }

    const fragmenterUpdateChecker = new FragmenterUpdateChecker();

    for (const track of addon.tracks) {
      const updateInfo = await fragmenterUpdateChecker.needsUpdate(track.url, installDir, { forceCacheBust: true });

      let info: ReleaseInfo;
      if (track.releaseModel.type === 'fragmenter') {
        info = {
          name: updateInfo.distributionManifest.version,
          changelogUrl: undefined,
          releaseDate: Date.now(),
        };
      } else {
        info = await AddonData.latestNonFragmenterVersionForTrack(addon, track);
      }

      store.dispatch(setAddonAndTrackLatestReleaseInfo({ addonKey: addon.key, trackKey: track.key, info }));

      if (track.key === state.installedTracks[addon.key]?.key && updateInfo.needsUpdate) {
        store.dispatch(setInstallStatus({ addonKey: addon.key, installState: { status: InstallStatus.NeedsUpdate } }));
      }
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

  private static notifyDownload(addon: Addon, successful: boolean): void {
    console.log('[InstallManager](notifyDownload) Requesting notification');

    Notification.requestPermission()
      .then(() => {
        console.log('InstallManager](notifyDownload) Showing notification');

        if (successful) {
          new Notification(`${addon.name} download complete!`, {
            icon: path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'Take to the skies!',
          });
        } else {
          new Notification('Download failed!', {
            icon: path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'Oops, something went wrong',
          });
        }
      })
      .catch((e) => console.log(e));
  }
}
