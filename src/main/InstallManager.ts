import {
  FragmenterContext,
  FragmenterContextEvents,
  FragmenterInstaller,
  FragmenterInstallerEvents,
} from '@flybywiresim/fragmenter';
import channels from 'common/channels';
import { ipcMain, WebContents } from 'electron';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs-extra';

let lastProgressSent = 0;

export class InstallManager {
  static async install(
    sender: WebContents,
    ourInstallID: number,
    url: string,
    tempDir: string,
    destDir: string,
  ): Promise<boolean | Error> {
    const abortController = new AbortController();

    const fragmenterContext = new FragmenterContext({ useConsoleLog: true }, abortController.signal);
    const fragmenterInstaller = new FragmenterInstaller(fragmenterContext, url, destDir, {
      temporaryDirectory: tempDir,
      forceManifestCacheBust: true,
    });

    const forwardFragmenterInstallerEvent = (event: keyof FragmenterInstallerEvents) => {
      fragmenterInstaller.on(event, (...args: unknown[]) => {
        if (event === 'downloadProgress' || event === 'unzipProgress' || event === 'copyProgress') {
          const currentTime = performance.now();
          const timeSinceLastProgress = currentTime - lastProgressSent;

          if (timeSinceLastProgress > 25) {
            sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);

            lastProgressSent = currentTime;
          }
        } else {
          sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
        }
      });
    };

    const forwardFragmenterContextEvent = (event: keyof FragmenterContextEvents) => {
      fragmenterContext.on(event, (...args: unknown[]) => {
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

    forwardFragmenterInstallerEvent('error');
    forwardFragmenterInstallerEvent('downloadStarted');
    forwardFragmenterInstallerEvent('downloadProgress');
    forwardFragmenterInstallerEvent('downloadInterrupted');
    forwardFragmenterInstallerEvent('downloadFinished');
    forwardFragmenterInstallerEvent('unzipStarted');
    forwardFragmenterInstallerEvent('unzipProgress');
    forwardFragmenterInstallerEvent('unzipFinished');
    forwardFragmenterInstallerEvent('copyStarted');
    forwardFragmenterInstallerEvent('copyProgress');
    forwardFragmenterInstallerEvent('copyFinished');
    forwardFragmenterInstallerEvent('retryScheduled');
    forwardFragmenterInstallerEvent('retryStarted');
    forwardFragmenterInstallerEvent('fullDownload');
    forwardFragmenterInstallerEvent('cancelled');
    forwardFragmenterInstallerEvent('logInfo');
    forwardFragmenterInstallerEvent('logWarn');
    forwardFragmenterInstallerEvent('logError');
    forwardFragmenterContextEvent('phaseChange');

    let ret = false;

    try {
      await fragmenterInstaller.install();

      ret = true;
    } catch (e) {
      if (e.message.startsWith('FragmenterError')) {
        ret = e;
      } else {
        throw e;
      }
    }

    // Tear down cancel event listener
    ipcMain.removeListener(channels.installManager.cancelInstall, handleCancelInstall);

    return ret;
  }

  static async directInstall(
    sender: WebContents,
    ourInstallID: number,
    url: string,
    tempDir: string,
    destDir: string,
    token: string,
  ): Promise<boolean | Error> {
    const abortController = new AbortController();

    // const fragmenterContext = new FragmenterContext({ useConsoleLog: true }, abortController.signal);
    // const fragmenterInstaller = new FragmenterInstaller(fragmenterContext, url, destDir, {
    //   temporaryDirectory: tempDir,
    //   forceManifestCacheBust: true,
    // });

    // Initializes Axios, executes at the bottom
    console.log(tempDir);
    const fileWriter = createWriteStream(tempDir);

    const req = axios.create();

    req.defaults.maxRedirects = 0;

    req.interceptors.response.use(
      (resp) => resp,
      (error) => {
        console.log(error);

        if (error.response.status && [301, 302].includes(error.response.status)) {
          const redirect = error.response.headers.location;

          axios({
            method: 'get',
            url: redirect,
            responseType: 'stream',
            headers: {
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }).then((resp) => {
            let downloadProgress = 0;

            return new Promise((resolve, reject) => {
              const length = Number(resp.headers['Content-Length']);

              resp.data.on('data', (chunk) => (downloadProgress += chunk.length));

              console.log(`Percentile: ${downloadProgress / length}`);

              resp.data.pipe(fileWriter);

              let error: null | Error = null;

              fileWriter.on('error', (err) => {
                error = err;
                fileWriter.close();
                reject(err);
              });
              fileWriter.on('close', () => {
                if (!error) {
                  resolve(true);
                }
              });
            });
          });
        }
        return Promise.reject(error);
      },
    );

    const forwardFragmenterInstallerEvent = (event: keyof FragmenterInstallerEvents) => {
      // fragmenterInstaller.on(event, (...args: unknown[]) => {
      //   if (event === 'downloadProgress' || event === 'unzipProgress' || event === 'copyProgress') {
      //     const currentTime = performance.now();
      //     const timeSinceLastProgress = currentTime - lastProgressSent;
      //
      //     if (timeSinceLastProgress > 25) {
      //       sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
      //
      //       lastProgressSent = currentTime;
      //     }
      //   } else {
      //     sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
      //   }
      // });
    };

    const forwardFragmenterContextEvent = (event: keyof FragmenterContextEvents) => {
      // fragmenterContext.on(event, (...args: unknown[]) => {
      //   sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
      // });
    };

    const handleCancelInstall = (_: unknown, installID: number) => {
      if (installID !== ourInstallID) {
        return;
      }

      abortController.abort();
    };

    // Setup cancel event listener
    ipcMain.on(channels.installManager.cancelInstall, handleCancelInstall);

    // forwardFragmenterInstallerEvent('error');
    // forwardFragmenterInstallerEvent('downloadStarted');
    // forwardFragmenterInstallerEvent('downloadProgress');
    // forwardFragmenterInstallerEvent('downloadInterrupted');
    // forwardFragmenterInstallerEvent('downloadFinished');
    // forwardFragmenterInstallerEvent('unzipStarted');
    // forwardFragmenterInstallerEvent('unzipProgress');
    // forwardFragmenterInstallerEvent('unzipFinished');
    // forwardFragmenterInstallerEvent('copyStarted');
    // forwardFragmenterInstallerEvent('copyProgress');
    // forwardFragmenterInstallerEvent('copyFinished');
    // forwardFragmenterInstallerEvent('retryScheduled');
    // forwardFragmenterInstallerEvent('retryStarted');
    // forwardFragmenterInstallerEvent('fullDownload');
    // forwardFragmenterInstallerEvent('cancelled');
    // forwardFragmenterInstallerEvent('logInfo');
    // forwardFragmenterInstallerEvent('logWarn');
    // forwardFragmenterInstallerEvent('logError');
    // forwardFragmenterContextEvent('phaseChange');

    let ret = false;

    try {
      await req.request({
        method: 'get',
        url: url,
        auth: {
          username: 'zigtag',
          password: token as string,
        },
        headers: {
          // Authorization: `Bearer ${gitHubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      ret = true;
    } catch (e) {
      if (e.message.startsWith('FragmenterError')) {
        ret = e;
      } else {
        throw e;
      }
    }

    // Tear down cancel event listener
    ipcMain.removeListener(channels.installManager.cancelInstall, handleCancelInstall);

    return ret;
  }

  static async uninstall(
    sender: WebContents,
    communityPackageDir: string,
    packageCacheDirs: string,
  ): Promise<boolean | Error> {
    const communityPackageDirExists = await promisify(fs.exists)(communityPackageDir);

    if (communityPackageDirExists) {
      await fs.promises.rm(communityPackageDir, { recursive: true });
    }

    for (const packageCacheDir of packageCacheDirs) {
      const packageCacheDirExists = await promisify(fs.exists)(packageCacheDir);

      if (packageCacheDirExists) {
        const dirents = await fs.promises.readdir(packageCacheDir);

        for (const dirent of dirents) {
          if (dirent !== 'work') {
            await fs.promises.unlink(path.join(packageCacheDir, dirent));
          }
        }
      }
    }

    return true;
  }

  static setupIpcListeners(): void {
    ipcMain.handle(
      channels.installManager.installFromUrl,
      async (event, installID: number, url: string, tempDir: string, destDir: string) => {
        return InstallManager.install(event.sender, installID, url, tempDir, destDir);
      },
    );

    ipcMain.handle(
      channels.installManager.directInstallFromUrl,
      async (event, installID: number, url: string, tempDir: string, destDir: string, token: string) => {
        return InstallManager.directInstall(event.sender, installID, url, tempDir, destDir, token);
      },
    );

    ipcMain.handle(
      channels.installManager.uninstall,
      async (event, communityPackageDir: string, packageCacheDirs: string) => {
        return InstallManager.uninstall(event.sender, communityPackageDir, packageCacheDirs);
      },
    );
  }
}
