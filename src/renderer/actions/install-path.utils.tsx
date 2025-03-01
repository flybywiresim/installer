import settings, {
  msfs2020StoreBasePath,
  msfs2020SteamBasePath,
  msfs2024StoreBasePath,
  msfs2024SteamBasePath,
} from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { dialog } from '@electron/remote';
import fs from 'fs';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';

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

export const setupSimulatorBasePath = async (sim: TypeOfSimulator): Promise<string> => {
  const currentPath = Directories.simulatorBasePath(sim);

  const availablePaths: string[] = [];
  if (sim === Simulators.Msfs2020) {
    if (fs.existsSync(msfs2020StoreBasePath)) {
      availablePaths.push('Microsoft Store Edition');
    }
    if (fs.existsSync(msfs2020SteamBasePath)) {
      availablePaths.push('Steam Edition');
    }
  }
  if (sim === Simulators.Msfs2024) {
    if (fs.existsSync(msfs2024StoreBasePath)) {
      availablePaths.push('Microsoft Store Edition');
    }
    if (fs.existsSync(msfs2024SteamBasePath)) {
      availablePaths.push('Steam Edition');
    }
  }

  if (availablePaths.length > 0) {
    availablePaths.push('Custom Directory');

    const { response } = await dialog.showMessageBox({
      title: 'FlyByWire Installer',
      message: `We found a possible MSFS ${sim.slice(-4)} installation.`,
      type: 'warning',
      buttons: availablePaths,
    });

    const selection = availablePaths[response];
    switch (sim) {
      case Simulators.Msfs2020:
        switch (selection) {
          case 'Microsoft Store Edition':
            settings.set(`mainSettings.simulator.${sim}.basePath`, msfs2020StoreBasePath);
            return msfs2020StoreBasePath;
          case 'Steam Edition':
            settings.set(`mainSettings.simulator.${sim}.basePath`, msfs2020SteamBasePath);
            return msfs2020SteamBasePath;
          case 'Custom Directory':
            break;
        }
        break;
      case Simulators.Msfs2024:
        switch (selection) {
          case 'Microsoft Store Edition':
            settings.set(`mainSettings.simulator.${sim}.basePath`, msfs2024StoreBasePath);
            return msfs2024StoreBasePath;
          case 'Steam Edition':
            settings.set(`mainSettings.simulator.${sim}.basePath`, msfs2024SteamBasePath);
            return msfs2024SteamBasePath;
          case 'Custom Directory':
            break;
        }
        break;
    }
  }

  return await selectPath(
    currentPath,
    `Select your MSFS ${sim.slice(-4)} base directory`,
    `mainSettings.simulator.${sim}.basePath`,
  );
};

export const setupMsfsCommunityPath = async (sim: TypeOfSimulator): Promise<string> => {
  const currentPath = Directories.installLocation(sim);

  return await selectPath(
    currentPath,
    `Select your MSFS ${sim.slice(-4)} community directory`,
    `mainSettings.simulator.${sim}.communityPath`,
  );
};

export const setupInstallPath = async (sim: TypeOfSimulator): Promise<string> => {
  const currentPath = Directories.installLocation(sim);

  return await selectPath(
    currentPath,
    `Select your MSFS ${sim.slice(-4)} install directory`,
    `mainSettings.simulator.${sim}.installPath`,
  );
};

export const setupTempLocation = async (): Promise<string> => {
  const currentPath = Directories.tempLocation();

  return await selectPath(currentPath, 'Select a location for temporary folders', 'mainSettings.tempLocation');
};
