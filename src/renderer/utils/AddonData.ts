import { Addon, AddonTrack, GithubBranchReleaseModel } from "renderer/utils/InstallerConfiguration";
import { GitVersions } from "@flybywiresim/api-client";

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

}
