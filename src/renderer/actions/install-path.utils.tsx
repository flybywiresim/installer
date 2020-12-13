import { remote } from 'electron';
import Store from 'electron-store';

const settings = new Store;

export async function setupInstallPath() {
    const path = await remote.dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (path.filePaths[0]) {
        settings.set('mainSettings.msfsPackagePath', path.filePaths[0]);
        return path.filePaths[0];
    } else {
        return "";
    }
}
