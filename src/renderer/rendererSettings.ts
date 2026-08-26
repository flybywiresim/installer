import Store, { Schema } from 'electron-store';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as packageInfo from '../../package.json';
import { defaultCommunityDir, msfsBasePath } from './actions/install-path.utils';
import { Simulators } from './utils/SimManager';
import { Directories } from './utils/Directories';

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
    qaConfigUrls: Record<number, string>;
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
                default: msfsBasePath(Simulators.Msfs2020) !== null,
              },
              basePath: {
                type: ['string', 'null'],
                default: msfsBasePath(Simulators.Msfs2020),
              },
              communityPath: {
                type: ['string', 'null'],
                default: defaultCommunityDir(msfsBasePath(Simulators.Msfs2020)),
              },
              installPath: {
                type: ['string', 'null'],
                default: defaultCommunityDir(msfsBasePath(Simulators.Msfs2020)),
              },
            },
          },
          msfs2024: {
            type: 'object',
            default: {},
            properties: {
              enabled: {
                type: 'boolean',
                default: msfsBasePath(Simulators.Msfs2024) !== null,
              },
              basePath: {
                type: ['string', 'null'],
                default: msfsBasePath(Simulators.Msfs2024),
              },
              communityPath: {
                type: ['string', 'null'],
                default: defaultCommunityDir(msfsBasePath(Simulators.Msfs2024)),
              },
              installPath: {
                type: ['string', 'null'],
                default: defaultCommunityDir(msfsBasePath(Simulators.Msfs2024)),
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
        default: Directories.osTemp(),
      },
      configDownloadUrl: {
        type: 'string',
        default: packageInfo.configUrls.production,
      },
      configForceUseLocal: {
        type: 'boolean',
        default: false,
      },
      qaConfigUrls: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'string',
        },
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

// TODO: Remove in future
// Transfer old MSFS path settings
if (store.get('mainSettings.msfsBasePath')) {
  store.set('mainSettings.simulator.msfs2020.basePath', store.get('mainSettings.msfsBasePath'));
  store.delete('mainSettings.msfsBasePath' as keyof RendererSettings);
}
if (store.get('mainSettings.msfsCommunityPath')) {
  store.set('mainSettings.simulator.msfs2020.communityPath', store.get('mainSettings.msfsCommunityPath'));
  store.delete('mainSettings.msfsCommunityPath' as keyof RendererSettings);
}
if (store.get('mainSettings.installPath')) {
  store.set('mainSettings.simulator.msfs2020.installPath', store.get('mainSettings.installPath'));
  store.delete('mainSettings.installPath' as keyof RendererSettings);
}

export default store;
