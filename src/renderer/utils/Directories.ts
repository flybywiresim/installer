import path from 'path';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import fs from 'fs';
import settings from 'renderer/rendererSettings';
import { app } from '@electron/remote';
import { Simulators } from './SimManager';

const TEMP_DIRECTORY_PREFIX = 'flybywire-current-install';

const TEMP_DIRECTORY_PREFIXES_FOR_CLEANUP = ['flybywire_current_install', TEMP_DIRECTORY_PREFIX];
export class Directories {
  private static sanitize(suffix: string): string {
    return path.normalize(suffix).replace(/^(\.\.(\/|\\|$))+/, '');
  }

  static appData(): string {
    return app.getPath('appData');
  }

  static localAppData(): string {
    return path.join(app.getPath('appData'), '..', 'Local');
  }

  static osTemp(): string {
    return app.getPath('temp');
  }

  static simulatorBasePath(sim: Simulators): string {
    return settings.get(`mainSettings.simulator.${sim}.basePath`) as string;
  }

  static communityLocation(sim: Simulators): string {
    return settings.get(`mainSettings.simulator.${sim}.communityPath`) as string;
  }

  static inCommunityLocation(sim: Simulators, targetDir: string): string {
    return path.join(Directories.communityLocation(sim), this.sanitize(targetDir));
  }

  static inCommunityPackage(addon: Addon, targetDir: string): string {
    const baseDir = this.inCommunityLocation(addon.simulator, this.sanitize(addon.targetDirectory));
    return path.join(baseDir, this.sanitize(targetDir));
  }

  static installLocation(sim: Simulators): string {
    return settings.get(`mainSettings.simulator.${sim}.installPath`) as string;
  }

  static inInstallLocation(sim: Simulators, targetDir: string): string {
    return path.join(Directories.installLocation(sim), this.sanitize(targetDir));
  }

  static inInstallPackage(addon: Addon, targetDir: string): string {
    const baseDir = this.inInstallLocation(addon.simulator, this.sanitize(addon.targetDirectory));
    return path.join(baseDir, this.sanitize(targetDir));
  }

  static tempLocation(sim: Simulators): string {
    return settings.get('mainSettings.separateTempLocation')
      ? (settings.get('mainSettings.tempLocation') as string)
      : this.installLocation(sim);
  }

  static inTempLocation(sim: Simulators, targetDir: string): string {
    return path.join(Directories.tempLocation(sim), this.sanitize(targetDir));
  }

  static inPackages(sim: Simulators, targetDir: string): string {
    return path
      .join(this.simulatorBasePath(sim), 'packages', this.sanitize(targetDir))
      .replace('LocalCache', 'LocalState');
  }

  static inPackageCache(addon: Addon, targetDir: string): string {
    const baseDir = this.inPackages(addon.simulator, this.sanitize(addon.targetDirectory));

    return path.join(baseDir, this.sanitize(targetDir));
  }

  static temp(sim: Simulators): string {
    const dir = path.join(
      Directories.tempLocation(sim),
      `${TEMP_DIRECTORY_PREFIX}-${(Math.random() * 1000).toFixed(0)}`,
    );
    if (fs.existsSync(dir)) {
      return Directories.temp(sim);
    }
    return dir;
  }

  static removeAllTemp(): void {
    console.log('[CLEANUP] Removing all temp directories');

    for (const sim in Simulators) {
      if (!fs.existsSync(Directories.tempLocation(sim as Simulators))) {
        console.warn('[CLEANUP] Location of temporary folders does not exist. Aborting');
        return;
      }

      try {
        const dirents = fs
          .readdirSync(Directories.tempLocation(sim as Simulators), { withFileTypes: true })
          .filter((dirEnt) => dirEnt.isDirectory())
          .filter((dirEnt) => TEMP_DIRECTORY_PREFIXES_FOR_CLEANUP.some((it) => dirEnt.name.startsWith(it)));

        for (const dir of dirents) {
          const fullPath = Directories.inTempLocation(sim as Simulators, dir.name);

          console.log('[CLEANUP] Removing', fullPath);
          try {
            fs.rmSync(fullPath, { recursive: true });
            console.log('[CLEANUP] Removed', fullPath);
          } catch (e) {
            console.error('[CLEANUP] Could not remove', fullPath, e);
          }
        }

        console.log('[CLEANUP] Finished removing all temp directories');
      } catch (e) {
        console.error('[CLEANUP] Could not scan folder', Directories.tempLocation(sim as Simulators), e);
      }
    }
  }

  static removeAlternativesForAddon(addon: Addon): void {
    addon.alternativeNames?.forEach((altName) => {
      const altDir = Directories.inInstallLocation(addon.simulator, altName);

      if (fs.existsSync(altDir)) {
        console.log('Removing alternative', altDir);
        fs.rmSync(altDir, { recursive: true });
      }
    });
  }

  static isFragmenterInstall(target: string | Addon): boolean {
    const targetDir =
      typeof target === 'string' ? target : Directories.inInstallLocation(target.simulator, target.targetDirectory);

    return fs.existsSync(path.join(targetDir, 'install.json'));
  }

  static isGitInstall(target: string | Addon): boolean {
    const targetDir =
      typeof target === 'string' ? target : Directories.inInstallLocation(target.simulator, target.targetDirectory);

    try {
      const symlinkPath = fs.readlinkSync(targetDir);
      if (symlinkPath && fs.existsSync(path.join(symlinkPath, '/../../../.git'))) {
        console.log('Is git repo', targetDir);
        return true;
      }
    } catch {
      console.log('Is not git repo', targetDir);
      return false;
    }
  }

  static inDocumentsFolder(targetDir: string): string {
    return path.join(app.getPath('documents'), this.sanitize(targetDir));
  }
}
