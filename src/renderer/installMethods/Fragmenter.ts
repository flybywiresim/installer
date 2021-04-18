import { InstallMethod, InstallResult } from "renderer/installMethods/index";
import { Directories } from "renderer/utils/Directories";
import fs from "fs-extra";
import { FragmenterInstaller } from "@flybywiresim/fragmenter";
import { Mod, ModTrack } from "renderer/utils/InstallerConfiguration";

export interface FragmenterOptions {
    forceCacheBust: boolean;
    forceFreshInstall: boolean;
}

export class Fragmenter extends InstallMethod<FragmenterOptions> {
    public async install(mod: Mod, track: ModTrack, abortSignal: AbortSignal, options: FragmenterOptions): Promise<InstallResult> {
        const installDir = Directories.inCommunity(mod.targetDirectory);
        const tempDir = Directories.temp();

        console.log('[INSTALL] Install options', options);
        console.log('[INSTALL] Installing into', installDir, 'using temp dir', tempDir);

        // Prepare temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
        }
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        console.log('[INSTALL] Checking for existing install');
        if (Directories.isFragmenterInstall(installDir)) {
            this.emit('progress', {
                canCancel: false,
                buttonText: 'Cancel',
                infoText: 'Preparing download',
                percent: 0,
            });

            console.log('[INSTALL] Found existing install at', installDir);
            console.log('[INSTALL] Copying existing install to', tempDir);
            await fs.copy(installDir, tempDir);
            console.log('[INSTALL] Finished copying');
        }

        try {
            let lastPercent = 0;

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on('downloadStarted', module => {
                console.log('[INSTALL] Downloading started for module', module.name);
                this.emit('progress', {
                    canCancel: true,
                    buttonText: 'Cancel',
                    infoText: `Downloading ${module.name.toLowerCase()} module: 0%`,
                    percent: 0,
                });
            });
            installer.on('downloadProgress', (module, progress) => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    this.emit('progress', {
                        canCancel: true,
                        buttonText: 'Cancel',
                        infoText: `Downloading ${module.name.toLowerCase()} module: ${progress.percent}%`,
                        percent: progress.percent,
                    });
                }
            });
            installer.on('unzipStarted', module => {
                console.log('[INSTALL] Started unzipping module', module.name);
                this.emit('progress', {
                    canCancel: false,
                    buttonText: 'Cancel',
                    infoText: 'Decompressing',
                    percent: 100,
                });
            });
            installer.on('retryScheduled', (module, retryCount, waitSeconds) => {
                console.log('[INSTALL] Scheduling a retry for module', module.name);
                console.log('[INSTALL] Retry count', retryCount);
                console.log('[INSTALL] Waiting for', waitSeconds, 'seconds');

                this.emit('progress', {
                    canCancel: false,
                    buttonText: 'Cancel',
                    infoText: `Retrying ${module.name.toLowerCase()} module`,
                    percent: 0,
                });
            });
            installer.on('retryStarted', (module, retryCount) => {
                console.log('[INSTALL] Starting a retry for module', module.name);
                console.log('[INSTALL] Retry count', retryCount);

                this.emit('progress', {
                    canCancel: true,
                    buttonText: 'Cancel',
                    infoText: `Downloading ${module.name.toLowerCase()} module: 0%`,
                    percent: 0,
                });
            });

            console.log('[INSTALL] Starting fragmenter download for URL', track.url);
            const installResult = await installer.install(abortSignal, {
                forceCacheBust: options.forceCacheBust,
                forceFreshInstall: options.forceFreshInstall,
                forceManifestCacheBust: true,
            });
            console.log('[INSTALL] Fragmenter download finished for URL', track.url);

            this.emit('progress', {
                canCancel: false,
                buttonText: 'Cancel',
                infoText: 'Finishing update',
                percent: 100,
            });

            // Copy files from temp dir
            Directories.removeTargetForMod(mod);
            console.log('[INSTALL] Copying files from', tempDir, 'to', installDir);
            await fs.copy(tempDir, installDir, { recursive: true });
            console.log('[INSTALL] Finished copying files from', tempDir, 'to', installDir);

            // Remove installs existing under alternative names
            console.log('[INSTALL] Removing installs existing under alternative names');
            Directories.removeAlternativesForMod(mod);
            console.log('[INSTALL] Finished removing installs existing under alternative names');

            console.log('[INSTALL] Finished download', installResult);
        } catch (e) {
            if (abortSignal.aborted) {
                this.emit('aborted');
            } else {
                this.emit('error', e);
                return Promise.reject(e);
            }
        } finally {
            // Clean up temp dir
            Directories.removeAllTemp();
        }

        const res: InstallResult = {
            aborted: abortSignal.aborted,
            done: !abortSignal.aborted,
        };

        this.emit('done', res);
        return Promise.resolve(res);
    }

}
