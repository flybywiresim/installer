import * as fs from 'fs';
import walk from 'walkdir';
import * as path from 'path';
import * as os from 'os';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { dialog } from '@electron/remote';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';

export const msfs2020StoreBasePath = path.join(
  Directories.localAppData(),
  '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\',
);
export const msfs2020SteamBasePath = path.join(Directories.appData(), '\\Microsoft Flight Simulator\\');
export const msfs2024StoreBasePath = path.join(
  Directories.localAppData(),
  '\\Packages\\Microsoft.Limitless_8wekyb3d8bbwe\\LocalCache\\',
);
export const msfs2024SteamBasePath = path.join(Directories.appData(), '\\Microsoft Flight Simulator 2024\\');

export const msfsBasePath = (version: number): string => {
  if (os.platform().toString() === 'linux') {
    return 'linux';
  }

  // Ensure proper functionality in main- and renderer-process
  let msfsConfigPath = null;

  const steamPath =
    version === 2020
      ? path.join(msfs2020SteamBasePath, 'UserCfg.opt')
      : path.join(msfs2024SteamBasePath, 'UserCfg.opt');
  const storePath =
    version === 2020
      ? path.join(msfs2020StoreBasePath, 'UserCfg.opt')
      : path.join(msfs2024StoreBasePath, 'UserCfg.opt');
  if (fs.existsSync(steamPath) && fs.existsSync(storePath)) return 'C:\\';
  if (fs.existsSync(steamPath)) {
    msfsConfigPath = steamPath;
  } else if (fs.existsSync(storePath)) {
    msfsConfigPath = storePath;
  } else {
    walk(Directories.localAppData(), (path) => {
      if (path.includes('Flight') && path.includes('UserCfg.opt')) {
        msfsConfigPath = path;
      }
    });
  }

  if (!msfsConfigPath) {
    return 'C:\\';
  }

  return path.dirname(msfsConfigPath);
};

export const defaultCommunityDir = (msfsBase: string): string => {
  const msfsConfigPath = path.join(msfsBase, 'UserCfg.opt');
  if (!fs.existsSync(msfsConfigPath)) {
    if (os.platform().toString() === 'linux') {
      return 'linux';
    }
    return 'C:\\';
  }

  try {
    const msfsConfig = fs.readFileSync(msfsConfigPath).toString();
    const msfsConfigLines = msfsConfig.split(/\r?\n/);
    const packagesPathLine = msfsConfigLines.find((line) => line.includes('InstalledPackagesPath'));
    const communityDir = path.join(packagesPathLine.split(' ').slice(1).join(' ').replaceAll('"', ''), '\\Community');

    return fs.existsSync(communityDir) ? communityDir : 'C:\\';
  } catch (e) {
    console.warn('Could not parse community dir from file', msfsConfigPath);
    console.error(e);
    return 'C:\\';
  }
};

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
