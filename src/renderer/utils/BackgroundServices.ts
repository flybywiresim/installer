import { Addon, ExternalApplicationDefinition, Publisher } from "renderer/utils/InstallerConfiguration";
import { Resolver } from "renderer/utils/Resolver";
import { store } from "renderer/redux/store";
import { ApplicationStatus } from "renderer/components/AddonSection/Enums";
import { ExternalApps } from "renderer/utils/ExternalApps";
import Winreg from 'winreg';
import path from "path";
import { Directories } from "renderer/utils/Directories";
import { spawn } from "child_process";
import { shell } from "@electron/remote";

export const AUTORUN_KEY = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

export class BackgroundServices {
    private static validateExecutablePath(path: string): boolean {
        return /^[a-zA-Z\d_-]+$/.test(path);
    }

    public static getExternalAppFromBackgroundService(addon: Addon, publisher: Publisher): ExternalApplicationDefinition {
        if (!addon.backgroundService) {
            throw new Error('Addon has no background service');
        }

        const appRef = addon.backgroundService.runCheckExternalAppRef;
        const app = Resolver.findDefinition(appRef, publisher);

        if (!app || app.kind !== 'externalApp') {
            throw new Error(`Attempted to find external app for background service, but runCheckExternalAppRef=${appRef} does not refer to a valid external app`);
        }

        return app;
    }

    static isRunning(addon: Addon, publisher: Publisher): boolean {
        const app = this.getExternalAppFromBackgroundService(addon, publisher);

        const state = store.getState().applicationStatus[app.key];

        return state === ApplicationStatus.Open;
    }

    private static getAutostartRegistryKey(): Winreg.Registry {
        return new Winreg({
            hive: Winreg.HKCU,
            key: AUTORUN_KEY,
        });
    }

    private static getAutoStartRegistryEntryName(addon: Addon, publisher: Publisher): string {
        return `fbw-installer-bgservice-${publisher.key}-${addon.key}`;
    }

    static async isAutoStartEnabled(addon: Addon, publisher: Publisher): Promise<boolean> {
        const backgroundService = addon.backgroundService;

        if (!backgroundService) {
            throw new Error('Addon has no background service');
        }

        const key = this.getAutostartRegistryKey();

        return new Promise((resolve) => {
            key.get(this.getAutoStartRegistryEntryName(addon, publisher), (err) => {
                if (err) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    static async setAutoStartEnabled(addon: Addon, publisher: Publisher, enabled: boolean): Promise<void> {
        const backgroundService = addon.backgroundService;

        if (!backgroundService) {
            throw new Error('Addon has no background service');
        }

        const exePath = path.join(Directories.inCommunity(addon.targetDirectory), backgroundService.executableFileBasename);
        const commandLineArgs = backgroundService.commandLineArgs
            ? ` ${backgroundService.commandLineArgs.join(' ')}`
            : '';

        const key = this.getAutostartRegistryKey();

        return new Promise((resolve, reject) => {
            if (enabled) {
                key.set(this.getAutoStartRegistryEntryName(addon, publisher), Winreg.REG_SZ, `${exePath}${commandLineArgs}`, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            } else {
                key.remove(this.getAutoStartRegistryEntryName(addon, publisher), () => {
                    resolve();
                });
            }
        });
    }

    static async start(addon: Addon): Promise<void> {
        const backgroundService = addon.backgroundService;

        if (!backgroundService) {
            throw new Error('Addon has no background service');
        }

        if (!this.validateExecutablePath(backgroundService.executableFileBasename)) {
            throw new Error('Executable path much match /^[a-zA-Z\\d_-]+$/.');
        }

        const exePath = path.normalize(path.join(Directories.inCommunity(addon.targetDirectory), `${backgroundService.executableFileBasename}.exe`));

        await shell.openPath(exePath);

        // if (exePath.startsWith('..')) {
        //     throw new Error('Validated and normalized path still traversed directory.');
        // }
        //
        // const commandLineArgs = backgroundService.commandLineArgs ?? [];
        //
        // spawn(exePath, commandLineArgs, { cwd: Directories.inCommunity(addon.targetDirectory), shell: true, detached: true });
    }

    static async kill(addon: Addon, publisher: Publisher): Promise<void> {
        const app = this.getExternalAppFromBackgroundService(addon, publisher);

        return ExternalApps.kill(app);
    }
}
