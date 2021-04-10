import { remote } from 'electron';
import Store from 'electron-store';

const settings = new Store;

export async function setupInstallPath(target: string): Promise<string> {
    let currentPath;
    if (target === 'aircraft') {
        currentPath = settings.get<string>('mainSettings.msfsPackagePath');
    } else if (target === 'liveries') {
        currentPath = settings.get<string>('mainSettings.liveriesPath');
    }

    const path = await remote.dialog.showOpenDialog({
        title: 'Select your community directory',
        defaultPath: typeof currentPath === 'string' ? currentPath : '',
        properties: ['openDirectory']
    });
    if (path.filePaths[0]) {
        if (target === 'aircraft') {
            settings.set('mainSettings.msfsPackagePath', path.filePaths[0]);
        } else if (target === 'liveries') {
            settings.set('mainSettings.liveriesPath', path.filePaths[0]);
        }
        return path.filePaths[0];
    } else {
        return "";
    }
}
