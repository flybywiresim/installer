import settings from "common/settings";
import { Directories } from "renderer/utils/Directories";
import { dialog } from "@electron/remote";

export const setupInstallPath = async (): Promise<string> => {
    const currentPath = Directories.community();

    const path = await dialog.showOpenDialog({
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
};

export const setupLiveriesPath = async (): Promise<string> => {
    const currentPath = Directories.liveries();

    const path = await dialog.showOpenDialog({
        title: 'Select your liveries directory',
        defaultPath: typeof currentPath === 'string' ? currentPath : '',
        properties: ['openDirectory']
    });

    if (path.filePaths[0]) {
        settings.set('mainSettings.liveriesPath', path.filePaths[0]);
        return path.filePaths[0];
    } else {
        return "";
    }
};
