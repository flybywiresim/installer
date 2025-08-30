import React from 'react';
import {
  setupInstallPath,
  setupSimulatorBasePath,
  defaultCommunityDir,
  setupTempLocation,
} from 'renderer/actions/install-path.utils';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { Button, ButtonType } from 'renderer/components/Button';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';
import { useErrors } from './useErrors';

type Error = {
  condition: boolean;
  title: string;
  description: React.ReactNode;
  actions: React.ReactNode;
};

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

  const errors: Error[] = [
    {
      condition: noSimInstalled,
      title: 'No simulator detected',
      description: (
        <>
          We could not find an installed simulator. Please select for which simulator you’d like to manage your addons.
          You can change your selection any time in the settings.
        </>
      ),
      actions: (
        <>
          <Button type={ButtonType.Neutral} onClick={() => enableSimulator(Simulators.Msfs2020)}>
            Microsoft Flight Simulator 2020
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => enableSimulator(Simulators.Msfs2024)}>
            Microsoft Flight Simulator 2024
          </Button>
        </>
      ),
    },
    {
      condition: msfs2020BasePathError,
      title: 'MSFS 2020 base path missing',
      description: (
        <>
          We couldn’t determine the correct MSFS 2020 base path. Please select it manually. <br />
          {platform === 'linux'
            ? 'Usually: ~/.local/share/Steam/steamapps/compatdata/<APPID>/pfx/drive_c/users/steamuser/AppData/Microsoft Flight Simulator/'
            : 'Usually: "%LOCALAPPDATA%\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache"'}
        </>
      ),
      actions: (
        <>
          <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2020)}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2020)}>
            I don’t have MSFS 2020 installed
          </Button>
        </>
      ),
    },
    {
      condition: msfs2024BasePathError,
      title: 'MSFS 2024 base path missing',
      description: (
        <>
          We couldn’t determine the correct MSFS 2024 base path. Please select it manually. <br />
          {platform === 'linux'
            ? 'You can usually find it somewhere here:\n~/.local/share/Steam/steamapps/compatdata/<APPID>/pfx/drive_c/users/steamuser/AppData/Microsoft Flight Simulator 2024/'
            : 'You can usually find it somewhere here:\n"%LOCALAPPDATA%\\Packages\\Microsoft.Limitless_8wekyb3d8bbwe\\LocalCache"'}
        </>
      ),
      actions: (
        <>
          <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2024)}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2024)}>
            I don’t have MSFS 2024 installed
          </Button>
        </>
      ),
    },
    {
      condition: msfs2020InstallError,
      title: 'MSFS 2020 Community folder not found',
      description: (
        <>
          Your MSFS 2020 Community folder is set to:
          <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation(Simulators.Msfs2020) || 'not set'}
          </pre>
          but we couldn’t find it there. Please set the correct location before continuing.
        </>
      ),
      actions: (
        <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2020)}>
          Select Path
        </Button>
      ),
    },
    {
      condition: msfs2024InstallError,
      title: 'MSFS 2024 Community folder not found',
      description: (
        <>
          Your MSFS 2024 Community folder is set to:
          <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation(Simulators.Msfs2024) || 'not set'}
          </pre>
          but we couldn’t find it there. Please set the correct location before continuing.
        </>
      ),
      actions: (
        <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2024)}>
          Select Path
        </Button>
      ),
    },
    {
      condition: tempLocationError,
      title: 'Temporary folder not found',
      description: (
        <>
          Your location for temporary folders is set to:
          <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {settings.get('mainSettings.tempLocation') || 'not set'}
          </pre>
          but we couldn’t find it there. Please set the correct location before continuing.
        </>
      ),
      actions: (
        <>
          <Button type={ButtonType.Neutral} onClick={handleSelectTempLocation}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={resetTempLocation}>
            Reset
          </Button>
        </>
      ),
    },
  ];

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
