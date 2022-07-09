import path from "path";
import { Addon } from "renderer/utils/InstallerConfiguration";
import fs from "fs-extra";
import settings from "common/settings";

export class Directories {

    static community(): string {
        return settings.get('mainSettings.msfsPackagePath') as string;
    }

    static inCommunity(targetDir: string): string {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, targetDir);
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
        return settings.get("mainSettings.separateTempPath")
            ? settings.get('mainSettings.tempPath') as string
            : path.join(settings.get('mainSettings.msfsPackagePath') as string, `flybywire_current_install_${(Math.random() * 1000).toFixed(0)}`);
    }

    static removeAllTemp(): void {
        console.log('[CLEANUP] Removing all temp files');

        if (!fs.existsSync(Directories.community())) {
            console.warn('[CLEANUP] Install directory does not exist. Aborting');
            return;
        }

        const separateSetting: boolean = settings.get("mainSettings.separateTempPath")
        const dir = separateSetting ? Directories.temp() : Directories.community();

        if(separateSetting && !fs.existsSync(dir)) {
            console.warn('[CLEANUP] Separate temp directory does not exist. Aborting');
            return;
        }

        if(separateSetting && dir == Directories.community()){
            console.warn('[CLEANUP] Temp directory is the same as the community directory. Aborting');
            return;
        }

        console.log('[CLEANUP] Removing', dir);

        if(separateSetting){
            fs.readdirSync(dir, { withFileTypes: true })
                .forEach(file => {
                    fs.removeSync(path.join(dir, file.name));
                });
        }else {
            fs.readdirSync(dir, { withFileTypes: true })
                .filter(dirEnt => dirEnt.isDirectory())
                .filter(dirEnt => dirEnt.name.startsWith('flybywire_current_install_'))
                .forEach(dir => {
                    const fullPath = Directories.inCommunity(dir.name);
                    fs.removeSync(fullPath);
                });
        }

        console.log('[CLEANUP] Removed', dir);
        console.log('[CLEANUP] Finished removing temp files');
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
