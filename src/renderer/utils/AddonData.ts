import { Addon, AddonTrack, GithubBranchReleaseModel } from "renderer/utils/InstallerConfiguration";
import { GitVersions } from "@flybywiresim/api-client";
import { Directories } from "./Directories";
import fs from 'fs-extra';
import store from "renderer/redux/store";
import * as actionTypes from '../redux/actionTypes';
import { getCurrentInstall, needsUpdate } from "@flybywiresim/fragmenter";
import _ from "lodash";
import { InstallStatus } from "renderer/components/AircraftSection";
import { useSetting } from "common/settings";
import yaml from 'js-yaml';

export type ReleaseInfo = {
    name: string,
    releaseDate: Date,
    changelogUrl?: string,
}

export class AddonData {

    static async latestVersionForTrack(addon: Addon, track: AddonTrack): Promise<ReleaseInfo> {
        if (track.releaseModel.type === 'githubRelease') {
            return this.latestVersionForReleasedTrack(addon);
        } else if (track.releaseModel.type === 'githubBranch') {
            return this.latestVersionForRollingTrack(addon, track.releaseModel);
        } else if (track.releaseModel.type === 'CDN') {
            console.log('look here')
            console.log(this.latestVersionForCDN(track));
            return this.latestVersionForCDN(track);
        }
    }

    private static async latestVersionForReleasedTrack(addon: Addon): Promise<ReleaseInfo> {
        return GitVersions.getReleases('flybywiresim', addon.repoName)
            .then((releases) => ({
                name: releases[0].name,
                releaseDate: releases[0].publishedAt,
                changelogUrl: releases[0].htmlUrl,
            }));
    }

    private static async latestVersionForRollingTrack(addon: Addon, releaseModel: GithubBranchReleaseModel): Promise<ReleaseInfo> {
        return GitVersions.getNewestCommit('flybywiresim', addon.repoName, releaseModel.branch)
            .then((commit) => ({
                name: commit.sha.substring(0, 7),
                releaseDate: commit.timestamp,
            }));
    }
    
    private static async latestVersionForCDN(track: AddonTrack): Promise<ReleaseInfo> {
        return fetch(track.url + '/releases.yaml')
        .then(res => res.blob())
        .then(blob => blob.text())
        .then(stream => ({
            name: (yaml.load(stream) as {releases: Array<{name: string, date: Date}>}).releases[0].name,
            releaseDate: (yaml.load(stream) as {releases: Array<{name: string, date: Date}>}).releases[0].date,
        }))
    }

    static async configureInitialAddonState(addon: Addon): Promise<void> {
        const setInstalledTrack = (newInstalledTrack: AddonTrack) => {
            store.dispatch({ type: actionTypes.SET_INSTALLED_TRACK, addonKey: addon.key, payload: newInstalledTrack });
        };
        const setSelectedTrack = (newSelectedTrack: AddonTrack) => {
            store.dispatch({ type: actionTypes.SET_SELECTED_TRACK, addonKey: addon.key, payload: newSelectedTrack });
        };
        const setInstallStatus = (new_state: InstallStatus) => {
            store.dispatch({ type: actionTypes.SET_INSTALL_STATUS, addonKey: addon.key, payload: new_state });
        };

        let selectedTrack: AddonTrack = null;
        if (!Directories.isFragmenterInstall(addon)) {
            console.log (addon.key, 'is not installed');
            selectedTrack = addon.tracks[0];
            setSelectedTrack(selectedTrack);
        } else {
            console.log (addon.key, 'is installed');
            try {
                const manifest = getCurrentInstall(Directories.inCommunity(addon.targetDirectory));
                console.log('Currently installed', manifest);

                let track = _.find(addon.tracks, { url: manifest.source });
                if (!track) {
                    track = _.find(addon.tracks, { alternativeUrls: [manifest.source] });
                }
                console.log('Currently installed', track);
                setInstalledTrack(track);
                setSelectedTrack(track);
                selectedTrack = track;
            } catch (e) {
                console.error(e);
                console.log('Not installed');
                setSelectedTrack(addon.tracks[0]);
                selectedTrack = addon.tracks[0];
            }
        }
        
        const [addonDiscovered] = useSetting<boolean>('cache.main.discoveredAddons.'+ addon.key);

        if (addon.hidden && !addonDiscovered) {
            setInstallStatus(InstallStatus.Hidden)
            return;
        }

        if (!selectedTrack) {
            console.log (addon.key, 'has unknown install status');
            setInstallStatus(InstallStatus.Unknown);
            return;
        }

        console.log('Checking install status');

        const installDir = Directories.inCommunity(addon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            console.log ('no existing install dir for', addon.key);
            setInstallStatus(InstallStatus.FreshInstall);
            return;
        }

        console.log('Checking for git install');
        if (Directories.isGitInstall(installDir)) {
            setInstallStatus(InstallStatus.GitInstall);
            return;
        }

        try {
            const updateInfo = await needsUpdate(selectedTrack.url, installDir, {
                forceCacheBust: true
            });
            console.log('Update info for', addon.key, updateInfo);

            if (updateInfo.isFreshInstall) {
                setInstallStatus(InstallStatus.FreshInstall);
                return;
            }

            if (updateInfo.needsUpdate) {
                setInstallStatus(InstallStatus.NeedsUpdate);
                return;
            }

            setInstallStatus(InstallStatus.UpToDate);
            return;
        } catch (e) {
            console.error(e);
            setInstallStatus(InstallStatus.Unknown);
            return;
        }
    }

}
