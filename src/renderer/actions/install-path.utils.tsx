import settings, { msStoreBasePath, steamBasePath } from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { dialog } from '@electron/remote';
import fs from 'fs';

const selectPath = async (currentPath: string, dialogTitle: string, setting: string): Promise<string> => {
  const path = await dialog.showOpenDialog({
    title: dialogTitle,
    defaultPath: typeof currentPath === 'string' ? currentPath : '',
    properties: ['openDirectory'],
  });

  if (path.filePaths[0]) {
    settings.set(setting, path.filePaths[0]);
    return path.filePaths[0];
  } else {
    return '';
  }
};

export const setupMsfsBasePath = async (): Promise<string> => {
  const currentPath = Directories.msfsBasePath();

  const availablePaths: string[] = [];
  if (fs.existsSync(msStoreBasePath)) {
    availablePaths.push('Microsoft Store Edition');
  }
  if (fs.existsSync(steamBasePath)) {
    availablePaths.push('Steam Edition');
  }

  if (availablePaths.length > 0) {
    availablePaths.push('Custom Directory');

    const { response } = await dialog.showMessageBox({
      title: 'FlyByWire Installer',
      message: 'We found a possible MSFS installation.',
      type: 'warning',
      buttons: availablePaths,
    });

    const selection = availablePaths[response];
    switch (selection) {
      case 'Microsoft Store Edition':
        settings.set('mainSettings.msfsBasePath', msStoreBasePath);
        return msStoreBasePath;
      case 'Steam Edition':
        settings.set('mainSettings.msfsBasePath', steamBasePath);
        return steamBasePath;
      case 'Custom Directory':
        break;
    }
  }

  return await selectPath(currentPath, 'Select your MSFS base directory', 'mainSettings.msfsBasePath');
};

export const setupMsfsCommunityPath = async (): Promise<string> => {
  const currentPath = Directories.installLocation();

  return await selectPath(currentPath, 'Select your MSFS community directory', 'mainSettings.msfsCommunityPath');
};

export const setupInstallPath = async (): Promise<string> => {
  const currentPath = Directories.installLocation();

  return await selectPath(currentPath, 'Select your install directory', 'mainSettings.installPath');
};

export const setupTempLocation = async (): Promise<string> => {
  const currentPath = Directories.tempLocation();

  return await selectPath(currentPath, 'Select a location for temporary folders', 'mainSettings.tempLocation');
};
