import { app, BrowserWindow, Menu, globalShortcut } from 'electron';
import * as fs from 'fs'
import * as readLine from 'readline';
import Store from 'electron-store';
import walk from 'walkdir';
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const settingsSchema: Record<string, unknown> = {
    mainSettings: {
        msfsPackagePath: 'string',
        cdn: 'url'
    }
}

const settings = new Store(settingsSchema);

Menu.setApplicationMenu(null)

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 800,
        width: 1200,
        frame: false,
        backgroundColor: '#FFF',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    globalShortcut.register('f5', () => {
        mainWindow.reload();
    })

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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.