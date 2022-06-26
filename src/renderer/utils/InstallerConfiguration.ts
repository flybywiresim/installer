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
    key: string,
    name: string,
    repoOwner?: string,
    repoName?: string,
    category?: `@${string}`,
    aircraftName: string,
    titleImageUrl: string,
    titleImageUrlSelected: string,
    backgroundImageUrls: string[],
    backgroundImageShadow?: boolean,
    shortDescription: string,
    description: string,
    techSpecs?: AddonTechSpec[],
    targetDirectory: string,
    alternativeNames?: string[],
    tracks: AddonTrack[],
    dependencies?: AddonDependency[],
    configurationAspects?: ConfigurationAspect[],
    disallowedRunningExternalApps?: string[],
    enabled: boolean,
    hidesAddon?: string,
    hidden?: boolean,
    hiddenName?: string,
    overrideAddonWhileHidden?: string,
    gitHubReleaseBaseURL?: string,
}

export interface AddonDependency {
    /**
     * Path to the addon, with the format `@<publisher>/<addon key>``
     */
    addon: `@${string}/${string}`,

    /**
     * Whether this dependency is optional. If `false`, the dependency addon will be installed before the parent addon, and removing the dependency
     * will cause the parent addon to be removed.
     */
    optional: boolean,

    /**
     * Modal text that shows below the dependency / parent addon on the pre-install modal (if optional) and the removal dialog (if not optional).
     */
    modalText?: string,
}

export interface AddonTechSpec {
    name: string,
    value: string,
}

/**
 * Describes a configuration aspect, allowing to customize an addon install
 */
export interface ConfigurationAspect {
    /**
     * A unique key for this configuration aspect
     */
    key: string,

    /**
     * The name of the configuration aspect, shown under the supertitle, in the associated tab
     */
    tabTitle: string,

    /**
     * The supertitle of the associated tab
     */
    tabSupertitle: string,

    /**
     * The title of the page containing the choices
     */
    title: string

    /**
     * What to apply the list of desired choices to
     */
    applyChoiceKeyTo: 'optionalFragmenterModule',

    /**
     * The kind of choice to permit
     */
    choiceKind: 'yesNo' | 'multipleChoice' | 'selectOne' | 'selectOneOrZero',

    /**
     * The possible choices. Must always be at least two, and if using `yesNo`, must be exactly 2 keyed `yes` and `no`.
     */
    choices: ConfigurationAspectChoice[],
}

interface ConfigurationAspectChoice {
    /**
     * A unique key for this choice
     */
    key: string,

    /**
     * The title of the choice, displayed on the card
     */
    title: string,

    /**
     * The subtitle of the choice, displayed on the card
     */
    subtitle?: string,

    /**
     * A longer description of the choice, displayed below the cards
     */
    description?: string,

    /**
     * An URL to an image representing the choice
     */
    imageUrl?: string,
}

interface DefinitionBase {
    kind: string,
}

export type AddonCategoryDefinition = DefinitionBase & {
    kind: 'addonCategory',
    key: string,
    title?: string,
    styles?: ('align-bottom')[],
}

export type ExternalApplicationDefinition = DefinitionBase & {
    kind: 'externalApp',
    key: string,
    prettyName: string,
    detectionType: 'http' | 'ws' | 'tcp',
    url?: string,
    port?: number,
}

export type Definition = AddonCategoryDefinition | ExternalApplicationDefinition

interface BasePublisherButton {
    text: string,
    style?: 'normal' | 'fbw-local-api-config',
    icon?: string,
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
    call: 'fbw-local-api-config',
}

export type PublisherButton = UrlPublisherButton | InternalAction

export type Publisher = {
    name: string,
    key: string,
    logoUrl: string,
    defs?: Definition[],
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
