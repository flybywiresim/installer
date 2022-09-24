import { Addon, AddonTrack, GithubBranchReleaseModel } from "../utils/InstallerConfiguration";
import { GitVersions } from "@flybywiresim/api-client";
import { Directories } from "./Directories";
import fs from 'fs-extra';
import { getCurrentInstall, FragmenterUpdateChecker } from "@flybywiresim/fragmenter";
import settings from "../common/settings";
import { store } from "../redux/store";
import { setInstalledTrack } from "../redux/features/installedTrack";
import { setSelectedTrack } from "../redux/features/selectedTrack";
import { InstallState, setInstallStatus } from "../redux/features/installStatus";
import yaml from 'js-yaml';
import { InstallStatus } from "../components/AddonSection/Enums";

export type ReleaseInfo = {
    name: string,
    releaseDate: number,
    changelogUrl?: string,
}

export class AddonData {
    static async latestVersionForTrack(addon: Addon, track: AddonTrack): Promise<ReleaseInfo> {
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
        return GitVersions.getReleases(addon.repoOwner, addon.repoName)
            .then((releases) => ({
                name: releases[0].name,
                releaseDate: releases[0].publishedAt.getTime(),
                changelogUrl: releases[0].htmlUrl,
            }));
    }

    private static async latestVersionForRollingTrack(addon: Addon, releaseModel: GithubBranchReleaseModel): Promise<ReleaseInfo> {
        return GitVersions.getNewestCommit(addon.repoOwner, addon.repoName, releaseModel.branch)
            .then((commit) => ({
                name: commit.sha.substring(0, 7),
                releaseDate: commit.timestamp.getTime(),
            }));
    }

    private static async latestVersionForCDN(track: AddonTrack): Promise<ReleaseInfo> {
        return fetch(track.url + '/releases.yaml')
            .then(res => res.blob())
            .then(blob => blob.text())
            .then(stream => ({
                name: 'v' + (yaml.load(stream) as {releases: Array<{name: string, date: Date}>}).releases[0].name,
                releaseDate: (yaml.load(stream) as {releases: Array<{name: string, date: Date}>}).releases[0].date.getTime(),
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
            console.log (addon.key, 'is not installed');
            selectedTrack = addon.tracks[0];
            setCurrentlySelectedTrack(selectedTrack);
        } else {
            console.log (addon.key, 'is installed');
            try {
                const manifest = getCurrentInstall(Directories.inCommunity(addon.targetDirectory));
                console.log('Currently installed', manifest);

                let track = addon.tracks.find(track => track.url.includes(manifest.source));
                if (!track) {
                    track = addon.tracks.find(track => track.alternativeUrls?.includes(manifest.source));
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

        const addonDiscovered = settings.get('cache.main.discoveredAddons.' + addon.key);

        if (addon.hidden && !addonDiscovered) {
            setCurrentInstallStatus({ status: InstallStatus.Hidden });
            return;
        }

        if (!selectedTrack) {
            console.log (addon.key, 'has unknown install status');
            setCurrentInstallStatus({ status: InstallStatus.Unknown });
            return;
        }

        console.log('Checking install status');

        const installDir = Directories.inCommunity(addon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            console.log ('no existing install dir for', addon.key);
            setCurrentInstallStatus({ status: InstallStatus.NotInstalled });
            return;
        }

        console.log('Checking for git install');
        if (Directories.isGitInstall(installDir)) {
            setCurrentInstallStatus({ status: InstallStatus.GitInstall });
            return;
        }

        try {
            const updateInfo = await new FragmenterUpdateChecker().needsUpdate(selectedTrack.url, installDir, {
                forceCacheBust: true,
            });

            if (updateInfo.isFreshInstall) {
                setCurrentInstallStatus({ status: InstallStatus.NotInstalled });
                return;
            }

            if (updateInfo.needsUpdate) {
                setCurrentInstallStatus({ status: InstallStatus.NeedsUpdate });
                return;
            }

            setCurrentInstallStatus({ status: InstallStatus.UpToDate });
            return;
        } catch (e) {
            console.error(e);
            setCurrentInstallStatus({ status: InstallStatus.Unknown });
            return;
        }
    }

    static async checkForUpdates(addon: Addon): Promise<void> {
        console.log("Checking for updates for " + addon.key);

        const dispatch = store.dispatch;

        const installDir = Directories.inCommunity(addon.targetDirectory);

        const state = store.getState();

        if (state.installStatus[addon.key].status === InstallStatus.UpToDate) {
            const updateInfo = await new FragmenterUpdateChecker().needsUpdate(state.selectedTracks[addon.key].url, installDir, {
                forceCacheBust: true,
            });
            if (updateInfo.needsUpdate) {
                dispatch(setInstallStatus({ addonKey: addon.key, installState: { status: InstallStatus.NeedsUpdate } }));
            }
        }
    }

}
