import { Addon, AddonTrack, GithubBranchReleaseModel } from 'renderer/utils/InstallerConfiguration';
import { GitVersions } from '@flybywiresim/api-client';
import { Directories } from './Directories';
import fs from 'fs';
import { getCurrentInstall, FragmenterUpdateChecker } from '@flybywiresim/fragmenter';
import settings from 'renderer/rendererSettings';
import { store } from 'renderer/redux/store';
import { setInstalledTrack } from 'renderer/redux/features/installedTrack';
import { setSelectedTrack } from 'renderer/redux/features/selectedTrack';
import { InstallState, setInstallStatus } from 'renderer/redux/features/installStatus';
import yaml from 'js-yaml';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';
import { setAddonAndTrackLatestReleaseInfo } from 'renderer/redux/features/latestVersionNames';

export type ReleaseInfo = {
  name: string;
  releaseDate: number;
  changelogUrl?: string;
};

export class AddonData {
  static async latestNonFragmenterVersionForTrack(addon: Addon, track: AddonTrack): Promise<ReleaseInfo> {
    switch (track.releaseModel.type) {
      case 'githubRelease':
        return this.latestVersionForReleasedTrack(addon);
      case 'githubBranch':
        return this.latestVersionForRollingTrack(addon, track.releaseModel);
      case 'CDN':
        return this.latestVersionForCDN(track);
    }
  }

  private static async latestVersionForReleasedTrack(addon: Addon): Promise<ReleaseInfo> {
    return GitVersions.getReleases(addon.repoOwner, addon.repoName).then((releases) => ({
      name: releases[0].name,
      releaseDate: releases[0].publishedAt.getTime(),
      changelogUrl: releases[0].htmlUrl,
    }));
  }

  private static async latestVersionForRollingTrack(
    addon: Addon,
    releaseModel: GithubBranchReleaseModel,
  ): Promise<ReleaseInfo> {
    return GitVersions.getNewestCommit(addon.repoOwner, addon.repoName, releaseModel.branch).then((commit) => ({
      name: commit.sha.substring(0, 7),
      releaseDate: commit.timestamp.getTime(),
    }));
  }

  private static async latestVersionForCDN(track: AddonTrack): Promise<ReleaseInfo> {
    return fetch(track.url + '/releases.yaml')
      .then((res) => res.blob())
      .then((blob) => blob.text())
      .then((stream) => ({
        name: 'v' + (yaml.load(stream) as { releases: Array<{ name: string; date: Date }> }).releases[0].name,
        releaseDate: (
          yaml.load(stream) as { releases: Array<{ name: string; date: Date }> }
        ).releases[0].date.getTime(),
      }));
  }

  static async configureInitialAddonState(addon: Addon): Promise<void> {
    const dispatch = store.dispatch;

    const setCurrentlyInstalledTrack = (newInstalledTrack: AddonTrack) => {
      dispatch(setInstalledTrack({ addonKey: addon.key, installedTrack: newInstalledTrack }));
    };

    const setCurrentlySelectedTrack = (newSelectedTrack: AddonTrack) => {
      dispatch(setSelectedTrack({ addonKey: addon.key, track: newSelectedTrack }));
    };

    const setCurrentInstallStatus = (new_state: InstallState) => {
      dispatch(setInstallStatus({ addonKey: addon.key, installState: new_state }));
    };

    let selectedTrack: AddonTrack;
    if (!Directories.isFragmenterInstall(addon)) {
      console.log(addon.key, 'is not installed');
      selectedTrack = addon.tracks[0];
      setCurrentlySelectedTrack(selectedTrack);
    } else {
      console.log(addon.key, 'is installed');
      try {
        const manifest = getCurrentInstall(Directories.inInstallLocation(addon.targetDirectory));
        console.log('Currently installed', manifest);

        let track = addon.tracks.find((track) => track.url.includes(manifest.source));
        if (!track) {
          track = addon.tracks.find((track) => track.alternativeUrls?.includes(manifest.source));
        }

        console.log('Currently installed', track);
        setCurrentlyInstalledTrack(track);
        setCurrentlySelectedTrack(track);
        selectedTrack = track;
      } catch (e) {
        console.error(e);
        console.log('Not installed');
        setCurrentlySelectedTrack(addon.tracks[0]);
        selectedTrack = addon.tracks[0];
      }
    }

    setCurrentInstallStatus({ status: InstallStatus.Unknown });

    try {
      await AddonData.checkForUpdates(addon);
    } catch (e) {
      console.error(e);
      return;
    }

    const addonDiscovered = settings.get('cache.main.discoveredAddons.' + addon.key);

    if (addon.hidden && !addonDiscovered) {
      setCurrentInstallStatus({ status: InstallStatus.Hidden });
      return;
    }

    if (!selectedTrack) {
      console.log(addon.key, 'has unknown install status');
      setCurrentInstallStatus({ status: InstallStatus.Unknown });
      return;
    }

    console.log('Checking install status');

    const installDir = Directories.inInstallLocation(addon.targetDirectory);

    if (!fs.existsSync(installDir)) {
      console.log('no existing install dir for', addon.key);
      setCurrentInstallStatus({ status: InstallStatus.NotInstalled });
      return;
    }

    console.log('Checking for git install');
    if (Directories.isGitInstall(installDir)) {
      setCurrentInstallStatus({ status: InstallStatus.GitInstall });
      return;
    }
  }

  static async checkForUpdates(addon: Addon): Promise<void> {
    console.log('Checking for updates for ' + addon.key);

    const installDir = Directories.inInstallLocation(addon.targetDirectory);

    const state = store.getState();

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

      if (track.key === state.selectedTracks[addon.key].key && updateInfo.needsUpdate) {
        store.dispatch(setInstallStatus({ addonKey: addon.key, installState: { status: InstallStatus.NeedsUpdate } }));
      }
    }
  }
}
