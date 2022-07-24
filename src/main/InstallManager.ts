import { FragmenterInstaller, FragmenterInstallerEvents } from "@flybywiresim/fragmenter";
import channels from "common/channels";
import { ipcMain, WebContents } from "electron";

export class InstallManager {
    static async install(
        sender: WebContents,
        ourInstallID: number,
        url: string,
        tempDir: string,
        destDir: string,
    ): Promise<void> {
        const fragmenterInstaller = new FragmenterInstaller(url, destDir);

        const abortController = new AbortController();

        const forwardFragmenterEvent = (event: keyof FragmenterInstallerEvents) => {
            fragmenterInstaller.on(event, (...args: unknown[]) => {
                sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
            });
        };

        const handleCancelInstall = (_: unknown, installID: number) => {
            if (installID !== ourInstallID) {
                return;
            }

            abortController.abort();
        };

        // Setup cancel event listener
        ipcMain.on(channels.installManager.cancelInstall, handleCancelInstall);

        forwardFragmenterEvent('error');
        forwardFragmenterEvent('downloadStarted');
        forwardFragmenterEvent('downloadProgress');
        forwardFragmenterEvent('downloadFinished');
        forwardFragmenterEvent('unzipStarted');
        forwardFragmenterEvent('unzipFinished');
        forwardFragmenterEvent('copyStarted');
        forwardFragmenterEvent('copyFinished');
        forwardFragmenterEvent('retryScheduled');
        forwardFragmenterEvent('retryStarted');
        forwardFragmenterEvent('fullDownload');
        forwardFragmenterEvent('logInfo');
        forwardFragmenterEvent('logWarn');
        forwardFragmenterEvent('logError');

        await fragmenterInstaller.install(
            abortController.signal,
            { temporaryDirectory: tempDir },
        );

        // Tear down cancel event listener
        ipcMain.removeListener(channels.installManager.cancelInstall, handleCancelInstall);
    }

    static setupIpcListeners(): void {
        ipcMain.handle(channels.installManager.installFromUrl, async (event, installID: number, url: string, tempDir: string, destDir: string) => {
            return InstallManager.install(event.sender, installID, url, tempDir, destDir);
        });
    }
}
