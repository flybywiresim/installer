import Store, { Schema } from 'electron-store';
import * as fs from 'fs';
import walk from 'walkdir';
import * as path from 'path';
import * as os from 'os';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as packageInfo from '../../package.json';
import { Directories } from 'renderer/utils/Directories';

export const msStoreBasePath = path.join(
  Directories.localAppData(),
  '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\',
);
export const steamBasePath = path.join(Directories.appData(), '\\Microsoft Flight Simulator\\');

const msfsBasePath = (): string => {
  if (os.platform().toString() === 'linux') {
    return 'linux';
  }

  // Ensure proper functionality in main- and renderer-process
  let msfsConfigPath = null;

  const steamPath = path.join(steamBasePath, 'UserCfg.opt');
  const storePath = path.join(msStoreBasePath, 'UserCfg.opt');
  if (fs.existsSync(steamPath) && fs.existsSync(storePath)) return 'C:\\';
  if (fs.existsSync(steamPath)) {
    msfsConfigPath = steamPath;
  } else if (fs.existsSync(storePath)) {
    msfsConfigPath = storePath;
  } else {
    walk(Directories.localAppData(), (path) => {
      if (path.includes('Flight') && path.includes('UserCfg.opt')) {
        msfsConfigPath = path;
      }
    });
  }

  if (!msfsConfigPath) {
    return 'C:\\';
  }

  return path.dirname(msfsConfigPath);
};

export const defaultCommunityDir = (msfsBase: string): string => {
  const msfsConfigPath = path.join(msfsBase, 'UserCfg.opt');
  if (!fs.existsSync(msfsConfigPath)) {
    if (os.platform().toString() === 'linux') {
      return 'linux';
    }
    return 'C:\\';
  }

  try {
    const msfsConfig = fs.readFileSync(msfsConfigPath).toString();
    const msfsConfigLines = msfsConfig.split(/\r?\n/);
    const packagesPathLine = msfsConfigLines.find((line) => line.includes('InstalledPackagesPath'));
    const communityDir = path.join(packagesPathLine.split(' ').slice(1).join(' ').replaceAll('"', ''), '\\Community');

    return fs.existsSync(communityDir) ? communityDir : 'C:\\';
  } catch (e) {
    console.warn('Could not parse community dir from file', msfsConfigPath);
    console.error(e);
    return 'C:\\';
  }
};

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
        default: msfsBasePath(),
      },
      msfsCommunityPath: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath()),
      },
      installPath: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath()),
      },
      separateTempLocation: {
        type: 'boolean',
        default: false,
      },
      tempLocation: {
        type: 'string',
        default: defaultCommunityDir(msfsBasePath()),
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
