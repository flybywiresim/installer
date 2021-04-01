import { app, BrowserWindow, Menu, globalShortcut, App, autoUpdater } from 'electron';
import * as fs from 'fs';
import * as readLine from 'readline';
import Store from 'electron-store';
import walk from 'walkdir';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

let settings = new Store;
let mainWindow: BrowserWindow;

Menu.setApplicationMenu(null);

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
            enableRemoteModule: true
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow.removeAllListeners();
        mainWindow = null;
        settings = null;
        app.quit();
    });

    const lastX = settings.get('cache.main.lastWindowX');
    const lastY = settings.get('cache.main.lastWindowY');

    if ((typeof lastX === "number") && (typeof lastY === "number") && !settings.get('cache.main.maximized')) {
        mainWindow.setBounds({
            width: lastX,
            height: lastY
        });
    } else if (settings.get('cache.main.maximized')) {
        mainWindow.maximize();
    }
    mainWindow.center();

    mainWindow.webContents.toggleDevTools();

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    if (process.env.NODE_ENV === 'development') {
        // Open the DevTools.
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
        // The Squirrel application will watch the provided URL
        autoUpdater.setFeedURL({ url: 'https://cdn.flybywiresim.com/installer/stable' });

        autoUpdater.addListener('update-downloaded', (event, releaseNotes, releaseName) => {
            mainWindow.webContents.send('update-downloaded', { event, releaseNotes, releaseName });
        });

        autoUpdater.addListener('update-available', () => {
            mainWindow.webContents.send('update-available');
        });

        autoUpdater.addListener('error', (error) => {
            mainWindow.webContents.send('update-error', { error });
        });

        // tell squirrel to check for updates
        autoUpdater.checkForUpdates();
    }

    configureSettings(app);
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function configureSettings(app: App) {
    if (!settings.has('mainSettings.disableExperimentalWarning')) {
        settings.set('mainSettings.disableExperimentalWarning', false);
    }
    if (!settings.has('mainSettings.useCdnCache')) {
        settings.set('mainSettings.useCdnCache', true);
    }

    if (!settings.has('mainSettings.msfsPackagePath')) {
        let userPath = null;

        const steamMsfsPath = app.getPath('appData') + "\\Microsoft Flight Simulator\\UserCfg.opt";
        const msStoreMsfsPath = app.getPath('home') + "\\AppData\\Local\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\UserCfg.opt";

        if (fs.existsSync(steamMsfsPath)) {
            userPath = steamMsfsPath;
        } else if (fs.existsSync(msStoreMsfsPath)) {
            userPath = msStoreMsfsPath;
        } else {
            walk(app.getPath('home') + "\\AppData\\Local\\", (path) => {
                if (path.includes("Flight") && path.includes("UserCfg.opt")) {
                    userPath = path;
                }
            });
        }

        if (userPath) {
            const msfsConfig = fs.createReadStream(userPath.toString());
            readLine.createInterface(msfsConfig).on('line', (line) => {
                if (line.includes("InstalledPackagesPath")) {
                    const splitLine = line.split(" ");
                    const combineSplit = splitLine.slice(1).join(" ");
                    const dir = combineSplit.replaceAll('"', '');
                    const msfs_community_path = dir + "\\Community\\";

                    settings.set('mainSettings.msfsPackagePath', msfs_community_path);
                }
            });
        }
    }
}
