import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { NsisUpdater } from 'electron-updater';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as packageInfo from '../../package.json';
import settings, { persistWindowSettings } from './mainSettings';
import channels from 'common/channels';
import * as remote from '@electron/remote/main';
import { InstallManager } from 'main/InstallManager';
import { SentryClient } from 'main/SentryClient';
import Store from 'electron-store';
import path from 'path';

function initializeApp() {
  Store.initRenderer();

  function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1280,
      minHeight: 800,
      frame: false,
      icon: 'src/main/icons/icon.ico',
      backgroundColor: '#1b2434',
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    remote.enable(mainWindow.webContents);

    const UpsertKeyValue = (
      header: Record<string, string> | Record<string, string[]>,
      keyToChange: string,
      value: string | string[],
    ) => {
      for (const key of Object.keys(header)) {
        if (key.toLowerCase() === keyToChange.toLowerCase()) {
          header[key] = value;
          return;
        }
      }
      header[keyToChange] = value;
    };

    // Prevent <a> tags from opening in Electron
    mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', '*');
      callback({ requestHeaders });
    });

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const { responseHeaders } = details;
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
      callback({
        responseHeaders,
      });
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow.removeAllListeners();
      app.quit();
    });

    ipcMain.on(channels.window.minimize, () => {
      mainWindow.minimize();
    });

    ipcMain.on(channels.window.maximize, () => {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    });

    ipcMain.on(channels.window.close, () => {
      persistWindowSettings(mainWindow);
      mainWindow.destroy();
    });

    ipcMain.on(channels.window.reload, () => {
      mainWindow.reload();
    });

    ipcMain.on(channels.window.isMaximized, (event) => {
      event.sender.send(channels.window.isMaximized, mainWindow.isMaximized());
    });

    ipcMain.on(channels.openPath, (_, value: string) => {
      void shell.openPath(value);
    });

    ipcMain.on('request-startup-at-login-changed', (_, value: boolean) => {
      app.setLoginItemSettings({
        openAtLogin: value,
      });
    });

    /*
     * Setting the value of the program's taskbar progress bar.
     * value: The value to set the progress bar to. ( [0 - 1.0], -1 to hide the progress bar )
     */
    ipcMain.on('set-window-progress-bar', (_, value: number) => {
      mainWindow.setProgressBar(value);
    });

    const lastX = settings.get<string, number>('cache.main.lastWindowX');
    const lastY = settings.get<string, number>('cache.main.lastWindowY');
    const shouldMaximize = settings.get<string, boolean>('cache.main.maximized');

    if (shouldMaximize) {
      mainWindow.maximize();
    } else if (lastX && lastY) {
      // 0 width and height should be reset to defaults
      mainWindow.setBounds({
        width: lastX,
        height: lastY,
      });
    }

    mainWindow.center();

    if (
      (settings.get('mainSettings.configDownloadUrl') as string) ===
      'https://cdn.flybywiresim.com/installer/config/production.json'
    ) {
      settings.set('mainSettings.configDownloadUrl', packageInfo.configUrls.production);
    }

    if (import.meta.env.DEV) {
      mainWindow.webContents.openDevTools();
    }

    if (!app.isPackaged) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL).then();
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).then();
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url).then();
      return { action: 'deny' };
    });

    if (import.meta.env.DEV) {
      // Open the DevTools.
      settings.openInEditor();
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.openDevTools();
      });
    }

    // Auto updater
    if (process.env.NODE_ENV !== 'development') {
      let updateOptions;
      if (packageInfo.version.includes('dev')) {
        updateOptions = {
          provider: 'generic' as const,
          url: 'https://flybywirecdn.com/installer/dev',
        };
      } else if (packageInfo.version.includes('rc')) {
        updateOptions = {
          provider: 'generic' as const,
          url: 'https://flybywirecdn.com/installer/rc',
        };
      } else {
        updateOptions = {
          provider: 'generic' as const,
          url: 'https://flybywirecdn.com/installer/release',
        };
      }

      const autoUpdater = new NsisUpdater(updateOptions);

      autoUpdater.addListener('update-downloaded', (event, releaseNotes, releaseName) => {
        mainWindow.webContents.send(channels.update.downloaded, { event, releaseNotes, releaseName });
      });

      autoUpdater.addListener('update-available', () => {
        mainWindow.webContents.send(channels.update.available);
      });

      autoUpdater.addListener('error', (error) => {
        mainWindow.webContents.send(channels.update.error, { error });
      });

      // tell autoupdater to check for updates
      mainWindow.once('show', () => {
        autoUpdater.checkForUpdates().then();
      });

      ipcMain.on(channels.checkForInstallerUpdate, () => {
        autoUpdater.checkForUpdates().then();
      });

      ipcMain.on('restartAndUpdate', () => {
        autoUpdater.quitAndInstall();
        app.exit();
      });
    }
  }

  if (!app.requestSingleInstanceLock()) {
    app.quit();
  }

  remote.initialize();

  app.setAppUserModelId('FlyByWire Installer');

  let mainWindow: BrowserWindow;

  Menu.setApplicationMenu(null);

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();

    if (import.meta.env.DEV) {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

      installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    }

    //Register keybinds
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Check if the input event is for window reloading
      if (
        input.type === 'keyUp' &&
        (input.key.toLowerCase() === 'r' || input.key === 'F5') &&
        (input.control || input.meta)
      ) {
        mainWindow.isFocused() && mainWindow.reload();
      }

      // Check if the input even is for dev tools
      if (input.type === 'keyUp' && input.key === 'F12' && (input.control || input.meta)) {
        mainWindow.isFocused() && mainWindow.webContents.toggleDevTools();
      }
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Someone tried to run a second instance, we should focus our window.
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

SentryClient.initialize();

InstallManager.setupIpcListeners();

initializeApp();
