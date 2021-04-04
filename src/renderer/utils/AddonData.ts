import { Mod, ModTrack, GithubBranchReleaseModel } from "renderer/utils/InstallerConfiguration";
import { GitVersions } from "@flybywiresim/api-client";

export type ReleaseInfo = {
    name: string,
    releaseDate: Date,
    changelogUrl?: string,
}

export class AddonData {

    static async latestVersionForTrack(mod: Mod, track: ModTrack): Promise<ReleaseInfo> {
        if (track.releaseModel.type === 'githubRelease') {
            return this.latestVersionForReleasedTrack(mod);
        } else if (track.releaseModel.type === 'githubBranch') {
            return this.latestVersionForRollingTrack(mod, track.releaseModel);
        }
    }

    private static async latestVersionForReleasedTrack(mod: Mod): Promise<ReleaseInfo> {
        return GitVersions.getReleases('flybywiresim', mod.repoName)
            .then((releases) => ({
                name: releases[0].name,
                releaseDate: releases[0].publishedAt,
                changelogUrl: releases[0].htmlUrl,
            }));
    }

    private static async latestVersionForRollingTrack(mod: Mod, releaseModel: GithubBranchReleaseModel): Promise<ReleaseInfo> {
        return GitVersions.getNewestCommit('flybywiresim', mod.repoName, releaseModel.branch)
            .then((commit) => ({
                name: commit.sha.substring(0, 7),
                releaseDate: commit.timestamp,
            }));
    }

}
