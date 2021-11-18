import { app, BrowserWindow, Menu, globalShortcut, shell, ipcMain } from 'electron';
import { NsisUpdater } from "electron-updater";
import * as path from 'path';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as packageInfo from '../../package.json';
import settings, { persistWindowSettings } from "common/settings";
import channels from "common/channels";
import * as remote from "@electron/remote/main";

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

remote.initialize();

app.setAppUserModelId('FlyByWire Installer');

let mainWindow: BrowserWindow;

Menu.setApplicationMenu(null);

const serve = process.argv.slice(1).some((arg) => arg === "--serve");

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 1000,
        width: 1400,
        minWidth: 1050,
        minHeight: 700,
        frame: false,
        icon: 'src/main/icons/icon.ico',
        backgroundColor: '#1b2434',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
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

    /*
     * Setting the value of the program's taskbar progress bar.
     * value: The value to set the progress bar to. ( [0 - 1.0], -1 to hide the progress bar )
     */
    ipcMain.on('set-window-progress-bar', (_, value: number) => {
        mainWindow.setProgressBar(value);
    });

    remote.enable(mainWindow.webContents);

    const lastX = settings.get<string, number>('cache.main.lastWindowX');
    const lastY = settings.get<string, number>('cache.main.lastWindowY');
    const shouldMaximize = settings.get<string, boolean>('cache.main.maximized');

    if (shouldMaximize) {
        mainWindow.maximize();
    } else if (lastX && lastY) { // 0 width and height should be reset to defaults
        mainWindow.setBounds({
            width: lastX,
            height: lastY
        });
    }

    mainWindow.center();

    // and load the index.html of the app.
    if (serve) {
        mainWindow.loadURL('http://localhost:8080/index.html').then();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).then();
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url).then();
        return { action: 'deny' };
    });

    if (process.env.NODE_ENV === 'development') {
        // Open the DevTools.
        settings.openInEditor();
        mainWindow.webContents.openDevTools();
    }

    globalShortcut.register('CmdOrCtrl+F5', () => {
        mainWindow.isFocused() && mainWindow.reload();
    });

    globalShortcut.register('CmdOrCtrl+F12', () => {
        mainWindow.isFocused() && mainWindow.webContents.toggleDevTools();
    });

    // Auto updater
    if (process.env.NODE_ENV !== 'development') {
        let updateOptions;
        if (packageInfo.version.includes('dev')) {
            updateOptions = {
                provider:'generic' as const,
                url: 'https://cdn.flybywiresim.com/installer/dev',
            };
        } else if (packageInfo.version.includes('rc')) {
            updateOptions = {
                provider:'generic' as const,
                url: 'https://cdn.flybywiresim.com/installer/rc',
            };
        } else {
            updateOptions = {
                provider:'generic' as const,
                url: 'https://cdn.flybywiresim.com/installer/release',
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
        autoUpdater.checkForUpdates().then();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();

    if (process.env.NODE_ENV === 'development') {
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));

        installExtension(REDUX_DEVTOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    }
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
