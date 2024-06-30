import {
  DownloadProgress,
  FragmenterContext,
  FragmenterContextEvents,
  FragmenterInstaller,
  FragmenterInstallerEvents,
  Module,
} from '@flybywiresim/fragmenter';
import channels from 'common/channels';
import { ipcMain, WebContents } from 'electron';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs-extra';
import { IEntryEvent, extract } from 'zip-lib';

let lastProgressSent = 0;

export class InstallManager {
  static async nuke(sender: WebContents, tempDir: string, destDir: string): Promise<boolean | Error> {
    const tempFile = path.join(tempDir, 'temp.zip');
    const destFile = path.join(destDir, 'flybywire-aircraft-a320-neo');

    fs.rmSync(tempFile);
    fs.rmdirSync(destFile);
  }

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
    usernameReq: string,
    prNum: number,
  ): Promise<boolean | Error> {
    const abortController = new AbortController();

    // const fragmenterContext = new FragmenterContext({ useConsoleLog: true }, abortController.signal);
    // const fragmenterInstaller = new FragmenterInstaller(fragmenterContext, url, destDir, {
    //   temporaryDirectory: tempDir,
    //   forceManifestCacheBust: true,
    // });

    // Initializes Axios, executes at the bottom
    console.log(tempDir);

    const tempD = tempDir;

    const qaModule: Module = {
      name: `QA #${prNum}`,
      sourceDir: destDir,
    };

    if (!fs.existsSync(tempD)) {
      fs.mkdirSync(tempD);
    }
    const tempFile = path.join(tempD, 'temp.zip');

    const fileWriter = createWriteStream(tempFile);

    const req = axios.create();

    req.defaults.maxRedirects = 0;

    console.log('');

    // const forwardFragmenterInstallerEvent = (event: keyof FragmenterInstallerEvents) => {
    //   // fragmenterInstaller.on(event, (...args: unknown[]) => {
    //   //   if (event === 'downloadProgress' || event === 'unzipProgress' || event === 'copyProgress') {
    //   //     const currentTime = performance.now();
    //   //     const timeSinceLastProgress = currentTime - lastProgressSent;
    //   //
    //   //     if (timeSinceLastProgress > 25) {
    //   //       sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
    //   //
    //   //       lastProgressSent = currentTime;
    //   //     }
    //   //   } else {
    //   //     sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
    //   //   }
    //   // });
    // };

    // const forwardFragmenterContextEvent = (event: keyof FragmenterContextEvents) => {
    //   // fragmenterContext.on(event, (...args: unknown[]) => {
    //   //   sender.send(channels.installManager.fragmenterEvent, ourInstallID, event, ...args);
    //   // });
    // };

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
      // const redirectUrl = await InstallManager.getArtifactRedirectUrl(url, usernameReq, token);

      // console.log(`got url: ${redirectUrl}`);

      const resp = await axios.get(url, {
        responseType: 'stream',
        auth: { username: usernameReq, password: token },
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      console.log(resp.headers);
      sender.send(channels.installManager.fragmenterEvent, 0, 'downloadStarted', qaModule);
      let downloadProgress = 0;

      await new Promise((resolve, reject) => {
        const length = resp.headers['content-length'];
        let lastProgressSent = performance.now();
        // let lastOutput = 0;

        // console.log(length);
        resp.data.on('data', (chunk: Buffer) => {
          downloadProgress += chunk.length;

          const currentTime = performance.now();
          const timeSinceLastProgress = currentTime - lastProgressSent;
          const output = Math.floor((downloadProgress / length) * 100);

          const progress: DownloadProgress = {
            loaded: downloadProgress,
            total: length,
            percent: output,
          };
          // if (downloadProgress === length) {
          //   console.log('Download done internally');
          // }

          if (timeSinceLastProgress > 25) {
            sender.send(channels.installManager.fragmenterEvent, 0, 'downloadProgress', qaModule, progress);
            // console.log(downloadProgress);
            lastProgressSent = currentTime;

            // if (lastOutput < output) {
            //   // console.log(`Progress: ${output}%`);
            //   lastOutput = output;
            // }
          }
        });

        resp.data.on('close', () => {
          fileWriter.close();
          resolve(true);
        });
        resp.data.on('error', (err: unknown) => {
          fileWriter.close();
          reject(err);
        });

        resp.data.pipe(fileWriter);
      });

      sender.send(channels.installManager.fragmenterEvent, 0, 'downloadFinished', qaModule);

      console.log('Done downloading, prepping for install.');

      // Prep
      const destFile = path.join(destDir, 'flybywire-aircraft-a320-neo');

      if (!fs.existsSync(destFile)) {
        fs.rmSync(destFile, { recursive: true, force: true });
      }

      // Do install
      console.log('Extracting.');

      sender.send(channels.installManager.fragmenterEvent, ourInstallID, 'unzipStarted', qaModule);

      let entryIndex = 0;

      let timeSinceLastProgress = performance.now();

      await extract(tempFile, destFile, {
        onEntry: ({ entryName, entryCount }: IEntryEvent) => {
          entryIndex++;

          const currentTime = performance.now();
          timeSinceLastProgress = currentTime - lastProgressSent;

          if (timeSinceLastProgress > 25) {
            sender.send(channels.installManager.fragmenterEvent, 0, 'unzipProgress', qaModule, {
              entryIndex,
              entryName,
              entryCount,
            });
          }
        },
      });

      sender.send(channels.installManager.fragmenterEvent, ourInstallID, 'unzipFinished', qaModule);

      fs.rmSync(tempFile);

      // Startup cleanup can handle this
      // if (tempD !== destDir) {
      //   fs.rmSync(tempD, { recursive: true, force: true });
      // } else {
      // }

      console.log('Done!');

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
    ipcMain.handle(channels.installManager.nuclearBomb, async (event, tempDir: string, destDir: string) => {
      return InstallManager.nuke(event.sender, tempDir, destDir);
    });

    ipcMain.handle(
      channels.installManager.installFromUrl,
      async (event, installID: number, url: string, tempDir: string, destDir: string) => {
        return InstallManager.install(event.sender, installID, url, tempDir, destDir);
      },
    );

    ipcMain.handle(
      channels.installManager.directInstallFromUrl,
      async (
        event,
        installID: number,
        url: string,
        tempDir: string,
        destDir: string,
        token: string,
        usernameReq: string,
        prNum: number,
      ) => {
        return InstallManager.directInstall(event.sender, installID, url, tempDir, destDir, token, usernameReq, prNum);
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
