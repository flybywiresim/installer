import * as fs from 'fs';
import walk from 'walkdir';
import * as path from 'path';
import * as os from 'os';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { dialog } from '@electron/remote';
import { managedSim, TypeOfSimulator } from 'renderer/utils/SimManager';

const possibleBasePaths = {
  msfs2020: {
    store: path.join(Directories.localAppData(), '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\'),
    steam: path.join(Directories.appData(), '\\Microsoft Flight Simulator\\'),
  },
  msfs2024: {
    store: path.join(Directories.localAppData(), '\\Packages\\Microsoft.Limitless_8wekyb3d8bbwe\\LocalCache\\'),
    steam: path.join(Directories.appData(), '\\Microsoft Flight Simulator 2024\\'),
  },
};

export const msfsBasePath = (sim: TypeOfSimulator): string => {
  if (os.platform().toString() === 'linux') {
    return 'linux';
  }

  // Ensure proper functionality in main- and renderer-process
  let msfsConfigPath = null;

  const steamPath = path.join(possibleBasePaths[sim].steam, 'UserCfg.opt');
  const storePath = path.join(possibleBasePaths[sim].store, 'UserCfg.opt');
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
  if (fs.existsSync(possibleBasePaths[sim].store)) {
    availablePaths.push('Microsoft Store Edition');
  }
  if (fs.existsSync(possibleBasePaths[sim].steam)) {
    availablePaths.push('Steam Edition');
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
    switch (selection) {
      case 'Microsoft Store Edition':
        settings.set(`mainSettings.simulator.${sim}.basePath`, possibleBasePaths[sim].store);
        return possibleBasePaths[sim].store;
      case 'Steam Edition':
        settings.set(`mainSettings.simulator.${sim}.basePath`, possibleBasePaths[sim].steam);
        return possibleBasePaths[sim].steam;
      case 'Custom Directory':
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
  const currentPath = Directories.tempLocation(managedSim());

  return await selectPath(currentPath, 'Select a location for temporary folders', 'mainSettings.tempLocation');
};
