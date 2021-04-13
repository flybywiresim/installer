import Store from "electron-store";
import path from "path";
import { Mod } from "renderer/utils/InstallerConfiguration";
import fs from "fs-extra";

const settings = new Store;

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

    static temp(): string {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, `flybywire_current_install_${(Math.random() * 1000).toFixed(0)}`);
    }

    static removeAllTemp(): void {
        console.log('[CLEANUP] Removing all temp directories');

        if (!settings.has('mainSettings.msfsPackagePath')) {
            console.warn('[CLEANUP] Install directory is not set. Aborting');
            return;
        }

        fs.readdirSync(Directories.community(), { withFileTypes: true })
            .filter(dirEnt => dirEnt.isDirectory())
            .filter(dirEnt => dirEnt.name.startsWith('flybywire_current_install_'))
            .forEach(dir => {
                const fullPath = Directories.inCommunity(dir.name);

                console.log('[CLEANUP] Removing', fullPath);
                fs.rmdirSync(fullPath, { recursive: true });
                console.log('[CLEANUP] Removed', fullPath);
            });
        console.log('[CLEANUP] Finished removing all temp directories');
    }

    static removeAlternativesForMod(mod: Mod): void {
        mod.alternativeNames?.forEach(altName => {
            const altDir = Directories.inCommunity(altName);

            if (fs.existsSync(altDir)) {
                console.log('Removing alternative', altDir);
                fs.rmdirSync(altDir, { recursive: true });
            }
        });
    }

    static removeTargetForMod(mod: Mod): void {
        const dir = Directories.inCommunity(mod.targetDirectory);

        if (fs.existsSync(dir)) {
            console.log('Removing', dir);
            fs.rmdirSync(dir, { recursive: true });
        }
    }

    static isFragmenterInstall(target: string | Mod): boolean {
        const targetDir = typeof target === 'string' ? target : Directories.inCommunity(target.targetDirectory);

        return fs.existsSync(path.join(targetDir, 'install.json'));
    }

    static isGitInstall(target: string | Mod): boolean {
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
