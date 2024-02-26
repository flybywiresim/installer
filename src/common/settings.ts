import Store, { Schema } from 'electron-store';
import * as fs from 'fs';
import walk from 'walkdir';
import * as path from 'path';
import * as os from 'os';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as packageInfo from '../../package.json';

const defaultCommunityDir = (): string => {
  if (os.platform().toString() === 'linux') {
    return 'linux';
  }

  // Ensure proper functionality in main- and renderer-process
  let msfsConfigPath = null;

  const steamPath = path.join(process.env.APPDATA, '\\Microsoft Flight Simulator\\UserCfg.opt');
  const storePath = path.join(
    process.env.LOCALAPPDATA,
    '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\UserCfg.opt',
  );

  if (fs.existsSync(steamPath)) {
    msfsConfigPath = steamPath;
  } else if (fs.existsSync(storePath)) {
    msfsConfigPath = storePath;
  } else {
    walk(process.env.LOCALAPPDATA, (path) => {
      if (path.includes('Flight') && path.includes('UserCfg.opt')) {
        msfsConfigPath = path;
      }
    });
  }

  if (!msfsConfigPath) {
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

export const persistWindowSettings = (window: Electron.BrowserWindow): void => {
  store.set('cache.main.maximized', window.isMaximized());

  const winSize = window.getSize();
  store.set('cache.main.lastWindowX', winSize[0]);
  store.set('cache.main.lastWindowY', winSize[1]);
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

interface Settings {
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
    msfsPackagePath: string;
    configDownloadUrl: string;
  };
  cache: {
    main: {
      lastWindowX: number;
      lastWindowY: number;
      maximized: boolean;
      lastShownSection: string;
      lastShownAddonKey: string;
    };
  };
  metaInfo: {
    lastVersion: string;
    lastLaunch: number;
  };
}

const schema: Schema<Settings> = {
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
      msfsCommunityPath: {
        type: 'string',
        default: defaultCommunityDir(),
      },
      installPath: {
        type: 'string',
        default: defaultCommunityDir(),
      },
      separateTempLocation: {
        type: 'boolean',
        default: false,
      },
      tempLocation: {
        type: 'string',
        default: defaultCommunityDir(),
      },
      configDownloadUrl: {
        type: 'string',
        default: packageInfo.configUrls.production,
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
          lastWindowX: {
            type: 'integer',
          },
          lastWindowY: {
            type: 'integer',
          },
          maximized: {
            type: 'boolean',
            default: false,
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
