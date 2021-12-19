import { defaultConfiguration } from "renderer/data";

export type AddonVersion = {
    title: string,
    date: Date,
    type: 'major' | 'minor' | 'patch'
}

export type GithubReleaseReleaseModel = {
    type: 'githubRelease',
}

export type GithubBranchReleaseModel = {
    type: 'githubBranch',
    branch: string,
}

export type CDNReleaseModel = {
    type: 'CDN',
}

export type ReleaseModel = GithubReleaseReleaseModel | GithubBranchReleaseModel | CDNReleaseModel

type BaseAddonTrack = {
    name: string,
    key: string,
    url: string,
    alternativeUrls?: string[],
    description?: string,
    releaseModel: ReleaseModel,
}

export type MainlineAddonTrack = BaseAddonTrack & { isExperimental: false }

export type ExperimentalAddonTrack = BaseAddonTrack & { isExperimental: true, warningContent: string }

export type AddonTrack = MainlineAddonTrack | ExperimentalAddonTrack;

export interface Addon {
    name: string,
    repoOwner?: string,
    repoName?: string,
    aircraftName: string,
    titleImageUrl: string,
    titleImageUrlSelected: string,
    key: string,
    backgroundImageUrls: string[],
    shortDescription: string,
    description: string,
    techSpecs?: AddonTechSpec[],
    menuIconUrl: string,
    targetDirectory: string,
    alternativeNames?: string[],
    tracks: AddonTrack[],
    enabled: boolean,
    hidesAddon?: string,
    hidden?: boolean,
    hiddenName?: string,
    overrideAddonWhileHidden?: string,
    gitHubReleaseBaseURL?: string,
}

export interface AddonTechSpec {
    name: string,
    value: string,
}

interface BasePublisherButton {
    text: string,
    icon: string,
    inline?: boolean,
    inop?: true,
    forceStroke?: true,
    action: string,
}

type UrlPublisherButton = BasePublisherButton & {
    action: 'openBrowser',
    url: string,
}

type InternalAction = BasePublisherButton & {
    action: 'internal',
    call: 'fbw-remote-mcdu' | 'fbw-remote-flypad',
}

export type PublisherButton = UrlPublisherButton | InternalAction

export type Publisher = {
    name: string,
    logoUrl: string,
    addons: Addon[],
    buttons?: PublisherButton[],
}

export type Configuration = {
    publishers: Publisher[],
}

export class InstallerConfiguration {

    static async obtain(): Promise<Configuration> {
        return this.fetchConfigurationFromApi().then((config) => {
            if (this.isConfigurationValid(config)) {
                return config;
            } else {
                return this.loadConfigurationFromLocalStorage().then((config) => {
                    if (this.isConfigurationValid(config)) {
                        return config;
                    } else {
                        return Promise.reject('Both network and local configurations are invalid');
                    }
                });
            }
        }).catch(() => {
            return this.loadConfigurationFromLocalStorage().then((config) => {
                if (this.isConfigurationValid(config)) {
                    console.warn('Network configuration was invalid, using local configuration');
                    return config;
                } else {
                    return Promise.reject('Could not retrieve network configuration, and local configuration is invalid');
                }
            });
        });
    }

    private static async fetchConfigurationFromApi(): Promise<Configuration> {
        return defaultConfiguration;
    }

    private static async loadConfigurationFromLocalStorage(): Promise<Configuration> {
        return defaultConfiguration;
    }

    private static isConfigurationValid(config: Configuration): boolean {
        return !!(config.publishers);
    }

}
