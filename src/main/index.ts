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

  // Suggestion for a new structure
function createWindow() {
    // ... browser window creation logic ...

    restoreWindowState(mainWindow);
    setupWebRequests(mainWindow);
    setupIpcHandlers(mainWindow); // Move all ipcMain.on calls here
    setupAutoUpdater(mainWindow); // Move auto-updater logic here

    // ... load URL, etc. ...
}

// Call the main functions after app is ready
app.on('ready', () => {
    const mainWindow = createWindow();
    setupDevTools();
    setupGlobalKeybinds(mainWindow);
});

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
