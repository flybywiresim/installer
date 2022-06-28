import { Addon, ExternalApplicationDefinition, Publisher } from "renderer/utils/InstallerConfiguration";
import { Resolver } from "renderer/utils/Resolver";
import { store } from "renderer/redux/store";
import { ApplicationStatus } from "renderer/components/AddonSection/Enums";
import { ExternalApps } from "renderer/utils/ExternalApps";
import Winreg from 'winreg';
import path from "path";
import { Directories } from "renderer/utils/Directories";

export const AUTORUN_KEY = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

export class BackgroundServices {
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

        const exePath = backgroundService.executable.baseLocation === 'absolute'
            ? backgroundService.executable.path
            : path.join(Directories.inCommunity(addon.targetDirectory), backgroundService.executable.path);

        const key = this.getAutostartRegistryKey();

        return new Promise((resolve, reject) => {
            if (enabled) {
                key.set(this.getAutoStartRegistryEntryName(addon, publisher), Winreg.REG_SZ, exePath, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            } else {
                key.remove(this.getAutoStartRegistryEntryName(addon, publisher), (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    }

    static async kill(addon: Addon, publisher: Publisher): Promise<void> {
        const app = this.getExternalAppFromBackgroundService(addon, publisher);

        return ExternalApps.kill(app);
    }
}
