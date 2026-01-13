import { defaultConfiguration } from 'renderer/data';
import settings from 'renderer/rendererSettings';
import { TypeOfSimulator } from './SimManager';

export interface ExternalLink {
  url: string;
  title: string;
}

export interface DirectoryDefinition {
  location: {
    in: 'community' | 'packageCache' | 'package' | 'documents';
    path: string;
  };
}

export interface NamedDirectoryDefinition extends DirectoryDefinition {
  title: string;
}

export type AddonVersion = {
  title: string;
  date: Date;
  type: 'major' | 'minor' | 'patch';
};

export type FragmenterReleaseModel = {
  type: 'fragmenter';
};

export type GithubReleaseReleaseModel = {
  /** @deprecated */
  type: 'githubRelease';
};

export type GithubBranchReleaseModel = {
  /** @deprecated */
  type: 'githubBranch';
  branch: string;
};

export type CDNReleaseModel = {
  /** @deprecated */
  type: 'CDN';
};

export type ReleaseModel =
  | FragmenterReleaseModel
  | GithubReleaseReleaseModel
  | GithubBranchReleaseModel
  | CDNReleaseModel;

type BaseAddonTrack = {
  name: string;
  key: string;
  url: string;
  alternativeUrls?: string[];
  description?: string;
  releaseModel: ReleaseModel;
};

export type MainlineAddonTrack = BaseAddonTrack & { isExperimental?: false; isQualityAssurance?: false };

export type ExperimentalAddonTrack = BaseAddonTrack & {
  isExperimental: true;
  warningContent: string;
  isQualityAssurance?: false;
};

export type QualityAssuranceAddonTrack = BaseAddonTrack & {
  isExperimental?: boolean;
  warningContent?: string;
  isQualityAssurance: true;
};

export type AddonTrack = MainlineAddonTrack | ExperimentalAddonTrack | QualityAssuranceAddonTrack;

export interface AddonBackgroundService {
  /**
   * Defines the executable file base name for the background service. This is relative to the community folder package
   * of the addon, must match /^[a-zA-Z\d_-]+$/, and must not contain a file extension.
   */
  executableFileBasename: string;

  /**
   * Reference to an external app which is used to check if this service is running
   */
  runCheckExternalAppRef: string;

  /**
   * Whether autostart configuration is available for the background service
   */
  enableAutostartConfiguration?: boolean;

  /**
   * Command line arguments to run this background service with
   *
   * Defaults to `true`.
   */
  commandLineArgs?: string[];
}

/**
 * Configuration for an addon's "My Install" page
 */
export interface AddonMyInstallPageConfiguration {
  /**
   * Links to show on the page. Those will be shown in a section on top, without a header, and open the user's browser.
   */
  links: ExternalLink[];

  /**
   * Folder quick-links to show. Those will be shown in a section on the bottom, with a header, and open the file explorer.
   */
  directories: NamedDirectoryDefinition[];
}

export interface Addon {
  key: string;
  name: string;
  simulator: TypeOfSimulator;
  repoOwner?: string;
  repoName?: string;
  category?: `@${string}`;
  aircraftName: string;
  titleImageUrl: string;
  titleImageUrlSelected: string;
  backgroundImageUrls: string[];
  backgroundImageShadow?: boolean;
  shortDescription: string;
  description: string;
  techSpecs?: AddonTechSpec[];
  targetDirectory: string;
  alternativeNames?: string[];
  tracks: AddonTrack[];
  dependencies?: AddonDependency[];
  incompatibleAddons?: AddonIncompatibleAddon[];
  configurationAspects?: ConfigurationAspect[];
  disallowedRunningExternalApps?: string[];
  backgroundService?: AddonBackgroundService;

  /**
   * Configuration for the "My Install" page of this addon. If not provided, a default page described below will be shown:
   *
   * Links: none
   *
   * Directories: Package in community directory
   *
   * If it is specified, the above elements are appended to the specified page contents.
   */
  myInstallPage?: AddonMyInstallPageConfiguration;

  enabled: boolean;
  hidesAddon?: string;
  hidden?: boolean;
  hiddenName?: string;
  overrideAddonWhileHidden?: string;
  gitHubReleaseBaseURL?: string;
}

export interface AddonDependency {
  /**
   * Path to the addon, with the format `@<publisher>/<addon key>``
   */
  addon: `@${string}/${string}`;

  /**
   * Whether this dependency is optional. If `false`, the dependency addon will be installed before the parent addon, and removing the dependency
   * will cause the parent addon to be removed.
   */
  optional: boolean;

  /**
   * Modal text that shows below the dependency / parent addon on the pre-install modal (if optional) and the removal dialog (if not optional).
   */
  modalText?: string;
}

/**
 * Fields from the addon's manifest.json
 */
export interface AddonIncompatibleAddon {
  /**
   * Field from the addon's manifest.json
   * This need to be configured identically to the addon's manifest.json
   * Leaving a field empty ignores it for the search.
   */
  title?: string;

  /**
   * Field from the addon's manifest.json
   * This need to be configured identically to the addon's manifest.json
   * Leaving a field empty ignores it for the search.
   */
  creator?: string;

  /**
   * Field from the addon's manifest.json
   * This need to be configured identically to the addon's manifest.json
   * Leaving a field empty ignores it for the search.
   *
   * This supports semver notation.
   */
  packageVersion?: string;

  /**
   * folder name in community - added later to show the user the corresponding folder name - not used for searching
   */
  folder?: string;

  /**
   * Description of the nature of the incompatibility to display to the user in a warning dialog
   */
  description?: string;
}

export interface AddonTechSpec {
  name: string;
  value: string;
}

/**
 * Describes a configuration aspect, allowing to customize an addon install
 */
export interface ConfigurationAspect {
  /**
   * A unique key for this configuration aspect
   */
  key: string;

  /**
   * The name of the configuration aspect, shown under the supertitle, in the associated tab
   */
  tabTitle: string;

  /**
   * The supertitle of the associated tab
   */
  tabSupertitle: string;

  /**
   * The title of the page containing the choices
   */
  title: string;

  /**
   * What to apply the list of desired choices to
   */
  applyChoiceKeyTo: 'optionalFragmenterModule';

  /**
   * The kind of choice to permit
   */
  choiceKind: 'yesNo' | 'multipleChoice' | 'selectOne' | 'selectOneOrZero';

  /**
   * The possible choices. Must always be at least two, and if using `yesNo`, must be exactly 2 keyed `yes` and `no`.
   */
  choices: ConfigurationAspectChoice[];
}

interface ConfigurationAspectChoice {
  /**
   * A unique key for this choice
   */
  key: string;

  /**
   * The title of the choice, displayed on the card
   */
  title: string;

  /**
   * The subtitle of the choice, displayed on the card
   */
  subtitle?: string;

  /**
   * A longer description of the choice, displayed below the cards
   */
  description?: string;

  /**
   * An URL to an image representing the choice
   */
  imageUrl?: string;
}

interface DefinitionBase {
  kind: string;
}

export type AddonCategoryDefinition = DefinitionBase & {
  kind: 'addonCategory';
  key: string;
  title?: string;
  styles?: 'align-bottom'[];
};

export type ExternalApplicationDefinition = DefinitionBase & {
  kind: 'externalApp';

  /**
   * Key of this external app. Must be unique
   */
  key: string;

  /**
   * Display name shown in the UI
   */
  prettyName: string;

  /**
   * Type of detection to figure out if the external app is running
   */
  detectionType: 'http' | 'ws' | 'tcp';

  /**
   * External app URL, only for `http` and `ws ` {@link detectionType} values. For `ws`, must start with `ws` or `wss`.
   */
  url?: string;

  /**
   * External app port, only for `tcp` {@link detectionType} values
   */
  port?: number;

  /**
   * URL on which to make a request to stop the external app
   */
  killUrl?: string;

  /**
   * HTTP method to use on the kill endpoint
   */
  killMethod?: string;
};

export type Definition = AddonCategoryDefinition | ExternalApplicationDefinition;

interface BasePublisherButton {
  text: string;
  style?: 'normal' | 'fbw-local-api-config';
  icon?: string;
  inline?: boolean;
  inop?: true;
  forceStroke?: true;
  action: string;
}

type UrlPublisherButton = BasePublisherButton & {
  action: 'openBrowser';
  url: string;
};

type InternalAction = BasePublisherButton & {
  action: 'internal';
  call: 'fbw-local-api-config';
};

export type PublisherButton = UrlPublisherButton | InternalAction;

export type Publisher = {
  name: string;
  key: string;
  logoUrl: string;
  logoSize?: number;
  defs?: Definition[];
  addons: Addon[];
  buttons?: PublisherButton[];
};

export interface Configuration {
  version: number;
  publishers: Publisher[];
}

type MergeStrategy<T> = {
  /**
   * Function to determine if two items are the same (for overriding)
   * If not provided, items are always appended
   */
  matcher?: (baseItem: T, overlayItem: T) => boolean;

  /**
   * Whether to override (replace) or merge when a match is found
   * Default: 'override'
   */
  onMatch?: 'override' | 'merge';

  /**
   * Custom merge function for when onMatch is 'merge'
   */
  customMerge?: (baseItem: T, overlayItem: T) => T;
};

export class InstallerConfiguration {
  static async obtain(): Promise<Configuration> {
    const forceUseLocalConfig = settings.get('mainSettings.configForceUseLocal') as boolean;

    if (forceUseLocalConfig) {
      return this.loadConfigurationFromLocalStorage();
    }

    return (
      this.fetchConfigurationFromUrl(settings.get('mainSettings.configDownloadUrl') as string) as Promise<Configuration>
    )
      .then(async (config) => {
        if (this.isConfigurationValid(config)) {
          console.log('Configuration from URL is valid');
          // Merge QA configurations
          const mergedConfig = await this.mergeQaConfigurations(config);
          return mergedConfig;
        } else {
          console.warn('CDN configuration was invalid, using local configuration');
          return this.loadConfigurationFromLocalStorage().then(async (config) => {
            if (this.isConfigurationValid(config)) {
              console.log('Configuration from local storage is valid');
              const mergedConfig = await this.mergeQaConfigurations(config);
              return mergedConfig;
            } else {
              return Promise.reject('Both CDN and local configurations are invalid');
            }
          });
        }
      })
      .catch(() => {
        return this.loadConfigurationFromLocalStorage().then(async (config) => {
          if (this.isConfigurationValid(config)) {
            console.warn('CDN configuration could not be loaded, using local configuration');
            const mergedConfig = await this.mergeQaConfigurations(config);
            return mergedConfig;
          } else {
            return Promise.reject('Could not retrieve CDN configuration, and local configuration is invalid');
          }
        });
      });
  }

  private static async mergeQaConfigurations(baseConfig: Configuration): Promise<Configuration> {
    const qaConfigUrls = settings.get('mainSettings.qaConfigUrls') as Record<number, string>;

    if (!qaConfigUrls || Object.keys(qaConfigUrls).length === 0) {
      return baseConfig;
    }

    let mergedConfig = { ...baseConfig };

    // Fetch all QA configurations in parallel
    const qaConfigPromises = Object.entries(qaConfigUrls).map(async ([key, url]) => {
      if (!url) return null;

      try {
        console.log(`Fetching QA configuration ${key} from: ${url}`);
        const qaConfig = await this.fetchConfigurationFromUrl(`${url}?cache-killer=${Math.random()}`);
        return { key: Number(key), config: qaConfig };
      } catch (error) {
        console.warn(`Failed to fetch QA configuration ${key} from ${url}:`, error);
        return null;
      }
    });

    const qaConfigs = await Promise.all(qaConfigPromises);

    // Sort by key to ensure consistent merge order
    const sortedQaConfigs = qaConfigs.filter((qa) => qa !== null).sort((a, b) => a!.key - b!.key);

    // Merge each QA configuration into the base config
    for (const qaConfigResult of sortedQaConfigs) {
      if (qaConfigResult) {
        console.log(`Merging QA configuration ${qaConfigResult.key}`);
        mergedConfig = this.mergeConfigurations(mergedConfig, qaConfigResult.config);
      }
    }

    return mergedConfig;
  }

  private static async fetchConfigurationFromUrl(url: string): Promise<Partial<Configuration> | Configuration> {
    const fullUrl = `${url}?cache-killer=${Math.random()}`;

    return await fetch(fullUrl)
      .then((res) => res.blob())
      .then((blob) => blob.text())
      .then((text) => JSON.parse(text))
      .catch(() => {
        throw new Error(`Could not retrieve configuration from ${url}`);
      });
  }

  private static mergeArrays<T>(baseArray: T[] = [], overlayArray: T[] = [], strategy: MergeStrategy<T> = {}): T[] {
    if (!overlayArray.length) return baseArray;
    if (!baseArray.length) return overlayArray;

    const { matcher, onMatch = 'override', customMerge } = strategy;
    const merged = [...baseArray];

    for (const overlayItem of overlayArray) {
      if (matcher) {
        const existingIndex = merged.findIndex((baseItem) => matcher(baseItem, overlayItem));

        if (existingIndex >= 0) {
          if (onMatch === 'merge' && customMerge) {
            merged[existingIndex] = customMerge(merged[existingIndex], overlayItem);
          } else {
            // Default: override
            merged[existingIndex] = overlayItem;
          }
        } else {
          merged.push(overlayItem);
        }
      } else {
        // No matcher provided, just append
        merged.push(overlayItem);
      }
    }

    return merged;
  }

  private static deepMergeObjects<T extends Record<string, any>>(
    base: T,
    overlay: Partial<T>,
    arrayMergeStrategies: Record<string, MergeStrategy<any>> = {},
  ): T {
    const merged = { ...base };

    for (const [key, value] of Object.entries(overlay)) {
      if (value === undefined) continue;

      if (Array.isArray(value) && Array.isArray(merged[key])) {
        // Use array merge strategy if provided
        const strategy = arrayMergeStrategies[key] || {};
        merged[key] = this.mergeArrays(merged[key], value, strategy);
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively merge objects
        merged[key] = this.deepMergeObjects(merged[key] || {}, value, arrayMergeStrategies);
      } else {
        // Primitive values: override
        merged[key] = value;
      }
    }

    return merged;
  }

  private static mergeConfigurations(base: Configuration, overlay: Partial<Configuration>): Configuration {
    return this.deepMergeObjects(base, overlay, {
      publishers: {
        matcher: (basePublisher, overlayPublisher) => basePublisher.key === overlayPublisher.key,
        onMatch: 'merge',
        customMerge: (basePublisher, overlayPublisher) => this.mergePublishers(basePublisher, overlayPublisher),
      },
    });
  }

  private static mergePublishers(base: Publisher, overlay: Partial<Publisher>): Publisher {
    return this.deepMergeObjects(base, overlay, {
      defs: {
        matcher: (baseDef, overlayDef) => {
          // Match by kind and key if both have keys
          if ('key' in baseDef && 'key' in overlayDef) {
            return baseDef.kind === overlayDef.kind && baseDef.key === overlayDef.key;
          }
          return false;
        },
      },
      buttons: {
        matcher: (baseButton, overlayButton) =>
          baseButton.text === overlayButton.text && baseButton.action === overlayButton.action,
      },
      addons: {
        matcher: (baseAddon, overlayAddon) => baseAddon.key === overlayAddon.key,
        onMatch: 'merge',
        customMerge: (baseAddon, overlayAddon) => this.mergeAddons(baseAddon, overlayAddon),
      },
    });
  }

  private static mergeAddons(base: Addon, overlay: Partial<Addon>): Addon {
    return this.deepMergeObjects(base, overlay, {
      tracks: {
        matcher: (baseTrack, overlayTrack) => baseTrack.key === overlayTrack.key,
      },
      dependencies: {
        matcher: (baseDep, overlayDep) => baseDep.addon === overlayDep.addon,
      },
      incompatibleAddons: {
        matcher: (baseIncompat, overlayIncompat) =>
          baseIncompat.title === overlayIncompat.title && baseIncompat.creator === overlayIncompat.creator,
      },
      configurationAspects: {
        matcher: (baseAspect, overlayAspect) => baseAspect.key === overlayAspect.key,
      },
      techSpecs: {
        matcher: (baseTechSpec, overlayTechSpec) => baseTechSpec.name === overlayTechSpec.name,
      },
    });
  }

  private static async loadConfigurationFromLocalStorage(): Promise<Configuration> {
    return defaultConfiguration;
  }

  private static isConfigurationValid(config: Configuration): boolean {
    return !!config.publishers;
  }
}
