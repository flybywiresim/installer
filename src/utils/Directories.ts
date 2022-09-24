import path from "path";
import { Addon } from "./InstallerConfiguration";
// import fs from "fs-extra";
// import settings from "../common/settings";

const TEMP_DIRECTORY_PREFIX = 'flybywire-current-install';

const MSFS_APPDATA_PATH = 'Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalState\\packages\\';
const MSFS_STEAM_PATH = 'Microsoft Flight Simulator\\Packages';

export class Directories {
    private static sanitize(suffix: string): string {
        return path.normalize(suffix).replace(/^(\.\.(\/|\\|$))+/, '');
    }

    static community(): string {
        // return settings.get('mainSettings.msfsPackagePath') as string;
        return ""
    }

    static inCommunity(targetDir: string): string {
        return path.join(Directories.community(), this.sanitize(targetDir));
    }

    static inCommunityPackage(addon: Addon, targetDir: string): string {
        const baseDir = this.inCommunity(this.sanitize(addon.targetDirectory));

        return path.join(baseDir, this.sanitize(targetDir));
    }

    static tempLocation(): string {
        // return settings.get('mainSettings.separateTempLocation') ? settings.get('mainSettings.tempLocation') as string : settings.get('mainSettings.msfsPackagePath') as string;
        return ""
    }

    static inTempLocation(targetDir: string): string {
        return path.join(Directories.tempLocation(), this.sanitize(targetDir));
    }

    static liveries(): string {
        // return settings.get('mainSettings.liveriesPath') as string;
        return ""
    }

    static inLiveries(targetDir: string): string {
        // return path.join(settings.get('mainSettings.liveriesPath') as string, this.sanitize(targetDir));
        return ""
    }

    static inPackagesMicrosoftStore(targetDir: string): string {
        return path.join(process.env.LOCALAPPDATA, MSFS_APPDATA_PATH, this.sanitize(targetDir));
    }

    static inPackagesSteam(targetDir: string): string {
        return path.join(process.env.APPDATA, MSFS_STEAM_PATH, this.sanitize(targetDir));
    }

    static inPackageCache(addon: Addon, targetDir: string): string {
        const baseDir = this.inPackagesSteam(this.sanitize(addon.targetDirectory));

        return path.join(baseDir, this.sanitize(targetDir));
    }

    static temp(): string {
        const dir = path.join(Directories.tempLocation(), `${TEMP_DIRECTORY_PREFIX}-${(Math.random() * 1000).toFixed(0)}`);
        // if (fs.existsSync(dir)) {
        //     return Directories.temp();
        // }
        return dir;
    }

    static removeAllTemp(): void {
        console.log('[CLEANUP] Removing all temp directories');

        // if (!fs.existsSync(Directories.tempLocation())) {
        //     console.warn('[CLEANUP] Location of temporary folders does not exist. Aborting');
        //     return;
        // }

        // fs.readdirSync(Directories.tempLocation(), { withFileTypes: true })
        //     .filter(dirEnt => dirEnt.isDirectory())
        //     .filter(dirEnt => dirEnt.name.startsWith(TEMP_DIRECTORY_PREFIX))
        //     .forEach(dir => {
        //         const fullPath = Directories.inTempLocation(dir.name);
        //
        //         console.log('[CLEANUP] Removing', fullPath);
        //         fs.removeSync(fullPath);
        //         console.log('[CLEANUP] Removed', fullPath);
        //     });
        console.log('[CLEANUP] Finished removing all temp directories');
    }

    static removeAlternativesForAddon(addon: Addon): void {
        addon.alternativeNames?.forEach(altName => {
            const altDir = Directories.inCommunity(altName);

            // if (fs.existsSync(altDir)) {
            //     console.log('Removing alternative', altDir);
            //     fs.removeSync(altDir);
            // }
        });
    }

    static removeTargetForAddon(addon: Addon): void {
        const dir = Directories.inCommunity(addon.targetDirectory);

        // if (fs.existsSync(dir)) {
        //     console.log('Removing', dir);
        //     fs.removeSync(dir);
        // }
    }

    static isFragmenterInstall(target: string | Addon): boolean {
        const targetDir = typeof target === 'string' ? target : Directories.inCommunity(target.targetDirectory);

        // return fs.existsSync(path.join(targetDir, 'install.json'));
        return true
    }

    static isGitInstall(target: string | Addon): boolean {
        const targetDir = typeof target === 'string' ? target : Directories.inCommunity(target.targetDirectory);

        try {
            // const symlinkPath = fs.readlinkSync(targetDir);
            // if (symlinkPath && fs.existsSync(path.join(symlinkPath, '/../.git'))) {
            //     console.log('Is git repo', targetDir);
            //     return true;
            // }
        } catch {
            console.log('Is not git repo', targetDir);
            return false;
        }

    }
}
