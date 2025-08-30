import React from 'react';
import {
  setupInstallPath,
  setupSimulatorBasePath,
  defaultCommunityDir,
  setupTempLocation,
} from 'renderer/actions/install-path.utils';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { TypeOfSimulator } from 'renderer/utils/SimManager';
import { useErrors } from './useErrors';
import { errorConfig } from './errorConfig';

const platform = os.platform();
const reload = () => ipcRenderer.send(channels.window.reload);

export const ErrorModal = (): JSX.Element => {
  const {
    noSimInstalled,
    msfs2020BasePathError,
    msfs2024BasePathError,
    msfs2020InstallError,
    msfs2024InstallError,
    tempLocationError,
  } = useErrors();

  const handleSelectSimulatorBasePath = async (sim: TypeOfSimulator) => {
    const path = await setupSimulatorBasePath(sim);
    if (path) {
      const communityDir = defaultCommunityDir(path);
      settings.set(`mainSettings.simulator.${sim}.communityPath`, communityDir);
      settings.set(`mainSettings.simulator.${sim}.installPath`, communityDir);
      reload();
    }
  };

  const handleSelectInstallPath = async (sim: TypeOfSimulator) => {
    const path = await setupInstallPath(sim);
    if (path) {
      settings.set(`mainSettings.simulator.${sim}.communityPath`, path);
      reload();
    }
  };

  const handleSelectTempLocation = async () => {
    const path = await setupTempLocation();
    if (path) {
      settings.set('mainSettings.tempLocation', path);
      reload();
    }
  };
  const resetTempLocation = () => {
    settings.set('mainSettings.tempLocation', Directories.osTemp());
    reload();
  };

  const handleSimulatorNotInstalled = (sim: TypeOfSimulator) => {
    settings.set(`mainSettings.simulator.${sim}.basePath`, 'notInstalled');
    reload();
  };

  const enableSimulator = (sim: TypeOfSimulator) => {
    settings.set(`mainSettings.simulator.${sim}.enabled`, true);
    reload();
  };

  const errors = errorConfig(
    platform,
    {
      noSimInstalled,
      msfs2020BasePathError,
      msfs2024BasePathError,
      msfs2020InstallError,
      msfs2024InstallError,
      tempLocationError,
    },
    {
      enableSimulator,
      handleSelectSimulatorBasePath,
      handleSimulatorNotInstalled,
      handleSelectInstallPath,
      handleSelectTempLocation,
      resetTempLocation,
    },
  );

  const activeError = errors.find((e) => e.condition);

  if (!activeError) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
      <span className="text-5xl font-semibold">Something went wrong.</span>
      <span className="w-3/5 text-center text-2xl">{activeError.description}</span>
      {activeError.actions}
    </div>
  );
};
