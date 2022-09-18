import { defaultConfiguration } from "renderer/data";

export interface ExternalLink {
    url: string,
    title: string,
}

export interface DirectoryDefinition {
    location: {
        in: 'community' | 'packageCache' | 'package',
        path: string,
    },
}

export interface NamedDirectoryDefinition extends DirectoryDefinition {
    title: string,
}

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

export interface AddonBackgroundService {
    /**
     * Defines the executable file base name for the background service. This is relative to the community folder package
     * of the addon, must match /^[a-zA-Z\d_-]+$/, and must not contain a file extension.
     */
    executableFileBasename: string,

    /**
     * Reference to an external app which is used to check if this service is running
     */
    runCheckExternalAppRef: string,

    /**
     * Whether autostart configuration is available for the background service
     */
    enableAutostartConfiguration?: boolean,

    /**
     * Command line arguments to run this background service with
     *
     * Defaults to `true`.
     */
    commandLineArgs?: string[],
}

/**
 * Configuration for an addon's "My Install" page
 */
export interface AddonMyInstallPageConfiguration {
    /**
     * Links to show on the page. Those will be shown in a section on top, without a header, and open the user's browser.
     */
    links: ExternalLink[],

    /**
     * Folder quick-links to show. Those will be shown in a section on the bottom, with a header, and open the file explorer.
     */
    directories: NamedDirectoryDefinition[],
}

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
    incompatibleAddons?: AddonIncompatibleAddon[],
    configurationAspects?: ConfigurationAspect[],
    disallowedRunningExternalApps?: string[],
    backgroundService?: AddonBackgroundService,

    /**
     * Configuration for the "My Install" page of this addon. If not provided, a default page described below will be shown:
     *
     * Links: none
     *
     * Directories: Package in community directory
     *
     * If it is specified, the above elements are appended to the specified page contents.
     */
    myInstallPage?: AddonMyInstallPageConfiguration,

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
 * fields from the addon's manifest.json
 */
export interface AddonIncompatibleAddon {
    /**
     * Fields from the addon's manifest.json
     * This need to be configured identically to the addon's manifest.json
     * Leaving a field empty ignores it for the search.
     */
    title?: string,
    creator?: string,
    package_version?: string,
    /**
     * folder name in community - added later to show the user the corresponding folder name - not used for searching
     */
    folder?: string,
    /**
     * Description of the nature of the incompatibility to display to the user in a warning dialog
     */
    description?: string
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

    /**
     * Key of this external app. Must be unique
     */
    key: string,

    /**
     * Display name shown in the UI
     */
    prettyName: string,

    /**
     * Type of detection to figure out if the external app is running
     */
    detectionType: 'http' | 'ws' | 'tcp',

    /**
     * External app URL, only for `http` and `ws ` {@link detectionType} values. For `ws`, must start with `ws` or `wss`.
     */
    url?: string,

    /**
     * External app port, only for `tcp` {@link detectionType} values
     */
    port?: number,

    /**
     * URL on which to make a request to stop the external app
     */
    killUrl?: string,

    /**
     * HTTP method to use on the kill endpoint
     */
    killMethod?: string,
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
    logoSize?: number,
    defs?: Definition[],
    addons: Addon[],
    buttons?: PublisherButton[],
}

export interface Configuration {
    version: number,
    publishers: Publisher[],
}

export class InstallerConfiguration {

    static async obtain(): Promise<Configuration> {
        console.log("Obtaining configuration");
        return this.fetchConfigurationFromCdn().then((config) => {
            if (this.isConfigurationValid(config)) {
                console.log("Configuration from API is valid");
                return config;
            } else {
                console.warn('Network configuration was invalid, using local configuration');
                return this.loadConfigurationFromLocalStorage().then((config) => {
                    if (this.isConfigurationValid(config)) {
                        console.log("Configuration from local storage is valid");
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

    private static async fetchConfigurationFromCdn(): Promise<Configuration> {
        console.log("Obtaining configuration from CDN");

        const configJson: Configuration = await fetch('https://cdn.flybywiresim.com/installer/config/staging.json')
            .then(res => res.blob())
            .then(blob => blob.text())
            .then(text => JSON.parse(text))
            .catch(() => {
                return Promise.reject('Could not retrieve CDN configuration');
            });

        console.log("Configuration from CDN: ", configJson);
        console.log("Configuration default: ", defaultConfiguration);

        return configJson;
    }

    private static async loadConfigurationFromLocalStorage(): Promise<Configuration> {
        return defaultConfiguration;
    }

    private static isConfigurationValid(config: Configuration): boolean {
        return !!(config.publishers);
    }

}
