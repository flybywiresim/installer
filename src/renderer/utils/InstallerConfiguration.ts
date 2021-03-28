import { defaultConfiguration } from "renderer/data";

export type ModVersion = {
    title: string,
    date: Date,
    type: 'major' | 'minor' | 'patch'
}

type BaseModTrack = {
    name: string,
    key: string,
    url: string,
    description: JSX.Element,
    fetchLatestVersionName: () => Promise<string>
}

export type MainlineModTrack = BaseModTrack & { isExperimental: false }

export type ExperimentalModTrack = BaseModTrack & { isExperimental: true, warningContent: JSX.Element }

export type ModTrack = MainlineModTrack | ExperimentalModTrack;

export type Mod = {
    name: string,
    repoName: string,
    aircraftName: string,
    key: string,
    backgroundImageUrls: string[],
    shortDescription: string,
    description: string,
    menuIconUrl: string,
    targetDirectory: string,
    alternativeNames?: string[],
    tracks: ModTrack[],
    enabled: boolean,
}

export type Configuration = {
    mods: Mod[],
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
        return !!(config.mods);
    }

}
