import { remote } from 'electron';
import Store from 'electron-store';

const settings = new Store;

export async function setupInstallPath(): Promise<string> {
    const currentPath = settings.get<string>('mainSettings.msfsPackagePath');

    const path = await remote.dialog.showOpenDialog({
        title: 'Select your community directory',
        defaultPath: typeof currentPath === 'string' ? currentPath : '',
        properties: ['openDirectory']
    });
    if (path.filePaths[0]) {
        settings.set('mainSettings.msfsPackagePath', path.filePaths[0]);
        if (!settings.get('mainSettings.separateLiveriesPath')) {
            settings.set('mainSettings.liveriesPath', path.filePaths[0]);
        }
        return path.filePaths[0];
    } else {
        return "";
    }
}

export async function setupLiveriesPath(): Promise<string> {
    const currentPath = settings.get<string>('mainSettings.liveriesPath');

    const path = await remote.dialog.showOpenDialog({
        title: 'Select your community directory',
        defaultPath: typeof currentPath === 'string' ? currentPath : '',
        properties: ['openDirectory']
    });
    if (path.filePaths[0]) {
        settings.set('mainSettings.liveriesPath', path.filePaths[0]);
        return path.filePaths[0];
    } else {
        return "";
    }
}
