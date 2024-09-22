import { Addon, AddonTrack, GithubBranchReleaseModel } from 'renderer/utils/InstallerConfiguration';
import { GitVersions } from '@flybywiresim/api-client';
import yaml from 'js-yaml';

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
}
