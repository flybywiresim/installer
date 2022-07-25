import path from "path";
import { Addon } from "renderer/utils/InstallerConfiguration";
import fs from "fs-extra";
import settings from "common/settings";

export class Directories {

    static community(): string {
        return settings.get('mainSettings.msfsPackagePath') as string;
    }

    static inCommunity(targetDir: string): string {
        return path.join(Directories.community(), targetDir);
    }

    static tempLocation(): string {
        return settings.get('mainSettings.separateTempLocation') ? settings.get('mainSettings.tempLocation') as string : settings.get('mainSettings.msfsPackagePath') as string;
    }

    static inTempLocation(targetDir: string): string {
        return path.join(Directories.tempLocation(), targetDir);
    }

    static liveries(): string {
        return settings.get('mainSettings.liveriesPath') as string;
    }

    static inLiveries(targetDir: string): string {
        return path.join(settings.get('mainSettings.liveriesPath') as string, targetDir);
    }

    static inPackagesMicrosoftStore(targetDir: string): string {
        return path.join(process.env.LOCALAPPDATA, 'Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalState\\packages\\', targetDir);
    }
    static inPackagesSteam(targetDir: string): string {
        return path.join(process.env.APPDATA, 'Microsoft Flight Simulator\\Packages', targetDir);
    }

    static temp(): string {
        const dir = path.join(Directories.tempLocation(), `flybywire_current_install_${(Math.random() * 1000).toFixed(0)}`);
        if (fs.existsSync(dir)) {
            return Directories.temp();
        }
        return dir;
    }

    static removeAllTemp(): void {
        console.log('[CLEANUP] Removing all temp directories');

        if (!fs.existsSync(Directories.tempLocation())) {
            console.warn('[CLEANUP] Location of temporary folders does not exist. Aborting');
            return;
        }

        fs.readdirSync(Directories.tempLocation(), { withFileTypes: true })
            .filter(dirEnt => dirEnt.isDirectory())
            .filter(dirEnt => dirEnt.name.startsWith('flybywire_current_install_'))
            .forEach(dir => {
                const fullPath = Directories.inTempLocation(dir.name);

                console.log('[CLEANUP] Removing', fullPath);
                fs.removeSync(fullPath);
                console.log('[CLEANUP] Removed', fullPath);
            });
        console.log('[CLEANUP] Finished removing all temp directories');
    }

    static removeAlternativesForAddon(addon: Addon): void {
        addon.alternativeNames?.forEach(altName => {
            const altDir = Directories.inCommunity(altName);

            if (fs.existsSync(altDir)) {
                console.log('Removing alternative', altDir);
                fs.removeSync(altDir);
            }
        });
    }

    static removeTargetForAddon(addon: Addon): void {
        const dir = Directories.inCommunity(addon.targetDirectory);

        if (fs.existsSync(dir)) {
            console.log('Removing', dir);
            fs.removeSync(dir);
        }
    }

    static isFragmenterInstall(target: string | Addon): boolean {
        const targetDir = typeof target === 'string' ? target : Directories.inCommunity(target.targetDirectory);

        return fs.existsSync(path.join(targetDir, 'install.json'));
    }

    static isGitInstall(target: string | Addon): boolean {
        const targetDir = typeof target === 'string' ? target : Directories.inCommunity(target.targetDirectory);

        try {
            const symlinkPath = fs.readlinkSync(targetDir);
            if (symlinkPath && fs.existsSync(path.join(symlinkPath, '/../.git'))) {
                console.log('Is git repo', targetDir);
                return true;
            }
        } catch {
            console.log('Is not git repo', targetDir);
            return false;
        }

    }
}
