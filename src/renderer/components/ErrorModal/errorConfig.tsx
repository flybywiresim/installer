import React from 'react';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';
import { Button, ButtonType } from 'renderer/components/Button';
import { Directories } from 'renderer/utils/Directories';
import settings from 'renderer/rendererSettings';

type Error = {
  condition: boolean;
  title: string;
  description: React.ReactNode;
  actions: React.ReactNode;
};

export const errorConfig = (
  platform: string,
  errors: {
    noSimInstalled: boolean;
    msfs2020BasePathError: boolean;
    msfs2024BasePathError: boolean;
    msfs2020InstallError: boolean;
    msfs2024InstallError: boolean;
    tempLocationError: boolean;
  },
  handlers: {
    enableSimulator: (sim: TypeOfSimulator) => void;
    handleSelectSimulatorBasePath: (sim: TypeOfSimulator) => Promise<void>;
    handleSimulatorNotInstalled: (sim: TypeOfSimulator) => void;
    handleSelectInstallPath: (sim: TypeOfSimulator) => Promise<void>;
    handleSelectTempLocation: () => Promise<void>;
    resetTempLocation: () => void;
  },
): Error[] => [
  {
    condition: errors.noSimInstalled,
    title: 'No simulator detected',
    description: (
      <>
        {
          "We could not find an installed simulator. Please select for which simulator you'd like to manage your addons. You can change your selection any time in the settings."
        }
      </>
    ),
    actions: (
      <>
        <Button type={ButtonType.Neutral} onClick={() => handlers.enableSimulator(Simulators.Msfs2020)}>
          Microsoft Flight Simulator 2020
        </Button>
        <Button type={ButtonType.Neutral} onClick={() => handlers.enableSimulator(Simulators.Msfs2024)}>
          Microsoft Flight Simulator 2024
        </Button>
      </>
    ),
  },
  {
    condition: errors.msfs2020BasePathError,
    title: 'MSFS 2020 base path missing',
    description: (
      <>
        {"We couldn't determine the correct MSFS 2020 base path. Please select it manually."} <br />
        {platform === 'linux'
          ? 'Usually: ~/.local/share/Steam/steamapps/compatdata/<APPID>/pfx/drive_c/users/steamuser/AppData/Microsoft Flight Simulator/'
          : 'Usually: "%LOCALAPPDATA%\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache"'}
      </>
    ),
    actions: (
      <>
        <Button type={ButtonType.Neutral} onClick={() => handlers.handleSelectSimulatorBasePath(Simulators.Msfs2020)}>
          Select Path
        </Button>
        <Button type={ButtonType.Neutral} onClick={() => handlers.handleSimulatorNotInstalled(Simulators.Msfs2020)}>
          {"I don't have MSFS 2020 installed"}
        </Button>
      </>
    ),
  },
  {
    condition: errors.msfs2024BasePathError,
    title: 'MSFS 2024 base path missing',
    description: (
      <>
        {"We couldn't determine the correct MSFS 2024 base path. Please select it manually."} <br />
        {platform === 'linux'
          ? 'You can usually find it somewhere here:\n~/.local/share/Steam/steamapps/compatdata/<APPID>/pfx/drive_c/users/steamuser/AppData/Microsoft Flight Simulator 2024/'
          : 'You can usually find it somewhere here:\n"%LOCALAPPDATA%\\Packages\\Microsoft.Limitless_8wekyb3d8bbwe\\LocalCache"'}
      </>
    ),
    actions: (
      <>
        <Button type={ButtonType.Neutral} onClick={() => handlers.handleSelectSimulatorBasePath(Simulators.Msfs2024)}>
          Select Path
        </Button>
        <Button type={ButtonType.Neutral} onClick={() => handlers.handleSimulatorNotInstalled(Simulators.Msfs2024)}>
          {"I don't have MSFS 2024 installed"}
        </Button>
      </>
    ),
  },
  {
    condition: errors.msfs2020InstallError,
    title: 'MSFS 2020 Community folder not found',
    description: (
      <>
        Your MSFS 2020 Community folder is set to:
        <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
          {Directories.installLocation(Simulators.Msfs2020) || 'not set'}
        </pre>
        {"but we couldn't find it there. Please set the correct location before continuing."}
      </>
    ),
    actions: (
      <Button type={ButtonType.Neutral} onClick={() => handlers.handleSelectInstallPath(Simulators.Msfs2020)}>
        Select Path
      </Button>
    ),
  },
  {
    condition: errors.msfs2024InstallError,
    title: 'MSFS 2024 Community folder not found',
    description: (
      <>
        Your MSFS 2024 Community folder is set to:
        <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
          {Directories.installLocation(Simulators.Msfs2024) || 'not set'}
        </pre>
        {"but we couldn't find it there. Please set the correct location before continuing."}
      </>
    ),
    actions: (
      <Button type={ButtonType.Neutral} onClick={() => handlers.handleSelectInstallPath(Simulators.Msfs2024)}>
        Select Path
      </Button>
    ),
  },
  {
    condition: errors.tempLocationError,
    title: 'Temporary folder not found',
    description: (
      <>
        Your location for temporary folders is set to:
        <pre className="mx-auto my-2 w-3/5 overflow-x-auto rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
          {settings.get('mainSettings.tempLocation') || 'not set'}
        </pre>
        {"but we couldn't find it there. Please set the correct location before continuing."}
      </>
    ),
    actions: (
      <>
        <Button type={ButtonType.Neutral} onClick={handlers.handleSelectTempLocation}>
          Select Path
        </Button>
        <Button type={ButtonType.Neutral} onClick={handlers.resetTempLocation}>
          Reset
        </Button>
      </>
    ),
  },
];
