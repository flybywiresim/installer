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

    static temp(): string {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, `flybywire_current_install_${(Math.random() * 1000).toFixed(0)}`);
    }

    static removeAllTemp(): void {
        console.log('[CLEANUP] Removing all temp directories');

        if (!fs.existsSync(Directories.community())) {
            console.warn('[CLEANUP] Install directory does not exist. Aborting');
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

    static removeAlternativesForAddon(addon: Addon): void {
        addon.alternativeNames?.forEach(altName => {
            const altDir = Directories.inCommunity(altName);

            if (fs.existsSync(altDir)) {
                console.log('Removing alternative', altDir);
                fs.rmdirSync(altDir, { recursive: true });
            }
        });
    }

    static removeTargetForAddon(addon: Addon): void {
        const dir = Directories.inCommunity(addon.targetDirectory);

        if (fs.existsSync(dir)) {
            console.log('Removing', dir);
            fs.rmdirSync(dir, { recursive: true });
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
