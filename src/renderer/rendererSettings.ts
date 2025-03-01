import Store, { Schema } from 'electron-store';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as packageInfo from '../../package.json';
import { defaultCommunityDir, msfsBasePath } from './actions/install-path.utils';

export const useSetting = <T>(key: string, defaultValue?: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState(store.get<string, T>(key, defaultValue));

  useEffect(() => {
    setStoredValue(store.get<string, T>(key, defaultValue));

    const cancel = store.onDidChange(key as never, (val) => {
      setStoredValue(val as T);
    });

    return () => {
      cancel();
    };
  }, [defaultValue, key]);

  const setValue = (newVal: T) => {
    store.set(key, newVal);
  };

  return [storedValue, setValue];
};

export const useIsDarkTheme = (): boolean => {
  return true;
};

interface RendererSettings {
  mainSettings: {
    autoStartApp: boolean;
    disableExperimentalWarning: boolean;
    disableDependencyPrompt: { [k: string]: { [k: string]: boolean } };
    disableBackgroundServiceAutoStartPrompt: { [k: string]: { [k: string]: boolean } };
    useCdnCache: boolean;
    dateLayout: string;
    useLongDateFormat: boolean;
    useDarkTheme: boolean;
    allowSeasonalEffects: boolean;
    msfsBasePath: string;
    configDownloadUrl: string;
    configForceUseLocal: boolean;
  };
  cache: {
    main: {
      lastShownSection: string;
      lastShownAddonKey: string;
    };
  };
  metaInfo: {
    lastVersion: string;
    lastLaunch: number;
  };
}

const schema: Schema<RendererSettings> = {
  mainSettings: {
    type: 'object',
    // Empty defaults are required when using type: "object" (https://github.com/sindresorhus/conf/issues/85#issuecomment-531651424)
    default: {},
    properties: {
      autoStartApp: {
        type: 'boolean',
        default: false,
      },
      disableExperimentalWarning: {
        type: 'boolean',
        default: false,
      },
      disableDependencyPrompt: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'object',
            default: {},
            additionalProperties: {
              type: 'boolean',
              default: false,
            },
          },
        },
      },
      disableBackgroundServiceAutoStartPrompt: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'boolean',
            default: false,
          },
        },
      },
      disableAddonDiskSpaceModal: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'boolean',
            default: false,
          },
        },
      },
      useCdnCache: {
        type: 'boolean',
        default: true,
      },
      dateLayout: {
        type: 'string',
        default: 'yyyy/mm/dd',
      },
      useLongDateFormat: {
        type: 'boolean',
        default: false,
      },
      useDarkTheme: {
        type: 'boolean',
        default: false,
      },
      allowSeasonalEffects: {
        type: 'boolean',
        default: true,
      },
      msfsBasePath: {
        type: 'string',
        default: msfsBasePath(2020),
      },
      msfsCommunityPath: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath(2020)),
      },
      installPath: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath(2020)),
      },
      simulator: {
        type: 'object',
        default: {},
        properties: {
          msfs2020: {
            type: 'object',
            default: {},
            properties: {
              enabled: {
                type: 'boolean',
                default: msfsBasePath(2020) !== 'C:\\' && msfsBasePath(2020) !== 'linux' ? true : false,
              },
              basePath: {
                type: 'string',
                default: msfsBasePath(2020),
              },
              communityPath: {
                type: 'string',
                default: defaultCommunityDir(msfsBasePath(2020)),
              },
              installPath: {
                type: 'string',
                default: defaultCommunityDir(msfsBasePath(2020)),
              },
            },
          },
          msfs2024: {
            type: 'object',
            default: {},
            properties: {
              enabled: {
                type: 'boolean',
                default: msfsBasePath(2024) !== 'C:\\' && msfsBasePath(2024) !== 'linux' ? true : false,
              },
              basePath: {
                type: 'string',
                default: msfsBasePath(2024),
              },
              communityPath: {
                type: 'string',
                default: defaultCommunityDir(msfsBasePath(2024)),
              },
              installPath: {
                type: 'string',
                default: defaultCommunityDir(msfsBasePath(2024)),
              },
            },
          },
        },
      },
      separateTempLocation: {
        type: 'boolean',
        default: false,
      },
      tempLocation: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath(2020)),
      },
      configDownloadUrl: {
        type: 'string',
        default: packageInfo.configUrls.production,
      },
      configForceUseLocal: {
        type: 'boolean',
        default: false,
      },
    },
  },
  cache: {
    type: 'object',
    default: {},
    properties: {
      main: {
        type: 'object',
        default: {},
        properties: {
          managedSim: {
            type: 'string',
            default: '',
          },
          lastShownSection: {
            type: 'string',
            default: '',
          },
          lastShownAddonKey: {
            type: 'string',
            default: '',
          },
        },
      },
    },
  },
  metaInfo: {
    type: 'object',
    default: {},
    properties: {
      lastVersion: {
        type: 'string',
        default: '',
      },
      lastLaunch: {
        type: 'integer',
        default: 0,
      },
    },
  },
};

const store = new Store({ schema, clearInvalidConfig: true });

// Workaround to flush the defaults
store.set('metaInfo.lastLaunch', Date.now());

export default store;
