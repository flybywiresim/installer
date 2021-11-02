import Store from "electron-store";
import * as fs from "fs-extra";
import walk from "walkdir";
import { app as electronApp, remote } from "electron";
import * as path from "path";
import { Schema } from "electron-store";
import { Dispatch, SetStateAction, useState } from "react";

const defaultCommunityDir = (): string => {
    // Ensure proper functionality in main- and renderer-process
    const app = electronApp || remote.app;
    let msfsConfigPath = null;

    const steamPath = path.join(app.getPath('appData'), "\\Microsoft Flight Simulator\\UserCfg.opt");
    const storePath = path.join(app.getPath('home'), "\\AppData\\Local\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\UserCfg.opt");

    if (fs.existsSync(steamPath)) {
        msfsConfigPath = steamPath;
    } else if (fs.existsSync(storePath)) {
        msfsConfigPath = storePath;
    } else {
        walk(path.join(app.getPath('home'), "\\AppData\\Local\\"), (path) => {
            if (path.includes("Flight") && path.includes("UserCfg.opt")) {
                msfsConfigPath = path;
            }
        });
    }

    if (!msfsConfigPath) {
        return 'C:\\';
    }

    const msfsConfig = fs.readFileSync(msfsConfigPath).toString();
    const msfsConfigLines = msfsConfig.split(/\r?\n/);
    const packagesPathLine = msfsConfigLines.find(line => line.includes('InstalledPackagesPath'));
    const communityDir = path.join(packagesPathLine.split(" ").slice(1).join(" ").replaceAll('"', ''), "\\Community");

    return fs.existsSync(communityDir) ? communityDir : 'C:\\';
};

export const persistWindowSettings = (window: Electron.BrowserWindow): void => {
    store.set('cache.main.maximized', window.isMaximized());

    const winSize = window.getSize();
    store.set('cache.main.lastWindowX', winSize[0]);
    store.set('cache.main.lastWindowY', winSize[1]);
};

export const useSetting = <T>(key: string): [T, Dispatch<SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState(store.get<string, T>(key));

    store.onDidChange(key as never, (val) => {
        setStoredValue(val as T);
    });

    const setValue = (newVal: T) => {
        store.set(key, newVal);
    };

    return [storedValue, setValue];
};

const schema: Schema<unknown> = {
    mainSettings: {
        type: "object",
        // Empty defaults are required when using type: "object" (https://github.com/sindresorhus/conf/issues/85#issuecomment-531651424)
        default: {},
        properties: {
            separateLiveriesPath: {
                type: "boolean",
                default: false
            },
            disableExperimentalWarning: {
                type: "boolean",
                default: false,
            },
            disabledIncompatibleLiveriesWarning: {
                type: "boolean",
                default: false,
            },
            useCdnCache: {
                type: "boolean",
                default: true,
            },
            dateLayout: {
                type: "string",
                default: "yyyy/mm/dd"
            },
            msfsPackagePath: {
                type: "string",
                default: defaultCommunityDir(),
            },
            liveriesPath: {
                type: "string",
                default: defaultCommunityDir(),
            }
        }
    },
    cache: {
        type: "object",
        default: {},
        properties: {
            main: {
                type: "object",
                default: {},
                properties: {
                    lastWindowX: {
                        type: "integer"
                    },
                    lastWindowY: {
                        type: "integer"
                    },
                    maximized: {
                        type: "boolean",
                        default: false,
                    }
                }
            }
        }
    },
    metaInfo: {
        type: "object",
        default: {},
        properties: {
            lastVersion: {
                type: "string",
                default: "",
            },
            lastLaunch: {
                type: "integer",
                default: 0,
            }
        }
    }
};

const store = new Store({ schema, clearInvalidConfig: true });

// Workaround to flush the defaults
store.set('metaInfo.lastLaunch', Date.now());

export default store;
