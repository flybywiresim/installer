import React, { useState } from 'react';
import {
  setupInstallPath,
  setupSimulatorBasePath,
  defaultCommunityDir,
  setupTempLocation,
} from 'renderer/actions/install-path.utils';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import * as fs from 'fs';
import { Button, ButtonType } from 'renderer/components/Button';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { Simulators } from 'renderer/utils/SimManager';

export const ErrorModal = (): JSX.Element => {
  const [noSimInstalled] = useState<boolean>(
    !settings.get(`mainSettings.simulator.${Simulators.Msfs2020}.enabled`) &&
      !settings.get(`mainSettings.simulator.${Simulators.Msfs2024}.enabled`),
  );
  const [msfs2020BasePathError] = useState<boolean>(
    settings.get(`mainSettings.simulator.${Simulators.Msfs2020}.enabled`) &&
      ((!fs.existsSync(Directories.simulatorBasePath(Simulators.Msfs2020)) &&
        Directories.simulatorBasePath(Simulators.Msfs2020) !== 'notInstalled') ||
        Directories.simulatorBasePath(Simulators.Msfs2020) === 'C:\\'),
  );
  const [msfs2024BasePathError] = useState<boolean>(
    settings.get(`mainSettings.simulator.${Simulators.Msfs2024}.enabled`) &&
      ((!fs.existsSync(Directories.simulatorBasePath(Simulators.Msfs2024)) &&
        Directories.simulatorBasePath(Simulators.Msfs2024) !== 'notInstalled') ||
        Directories.simulatorBasePath(Simulators.Msfs2024) === 'C:\\'),
  );
  const [msfs2020installLocationError] = useState<boolean>(
    settings.get(`mainSettings.simulator.${Simulators.Msfs2020}.enabled`) &&
      (!fs.existsSync(Directories.installLocation(Simulators.Msfs2020)) ||
        Directories.installLocation(Simulators.Msfs2020) === 'C:\\' ||
        !fs.existsSync(Directories.communityLocation(Simulators.Msfs2020))),
  );
  const [msfs2024installLocationError] = useState<boolean>(
    settings.get(`mainSettings.simulator.${Simulators.Msfs2024}.enabled`) &&
      (!fs.existsSync(Directories.installLocation(Simulators.Msfs2024)) ||
        Directories.installLocation(Simulators.Msfs2024) === 'C:\\' ||
        !fs.existsSync(Directories.communityLocation(Simulators.Msfs2024))),
  );
  const [tempLocationError] = useState<boolean>(!fs.existsSync(settings.get('mainSettings.tempLocation')));

  const handleSelectSimulatorBasePath = async (sim: Simulators) => {
    const path = await setupSimulatorBasePath(sim);
    if (path) {
      const communityDir = defaultCommunityDir(path);
      settings.set(`mainSettings.simulator.${sim}.communityPath`, communityDir);
      settings.set(`mainSettings.simulator.${sim}.installPath`, communityDir);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleSelectInstallPath = async (sim: Simulators) => {
    const path = await setupInstallPath(sim);
    if (path) {
      settings.set(`mainSettings.simulator.${sim}.communityPath`, path);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleSelectTempLocation = async () => {
    const path = await setupTempLocation();
    if (path) {
      settings.set('mainSettings.tempLocation', path);
      ipcRenderer.send(channels.window.reload);
    }
  };
  const resetTempLocation = () => {
    settings.set('mainSettings.tempLocation', Directories.osTemp());
    ipcRenderer.send(channels.window.reload);
  };

  const handleSimulatorNotInstalled = (sim: Simulators) => {
    settings.set(`mainSettings.simulator.${sim}.basePath`, 'notInstalled');
    ipcRenderer.send(channels.window.reload);
  };

  const content = (): JSX.Element => {
    if (noSimInstalled) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">
            We could not find an installed simulator. Please select for which simulator you&apos;d like to manage your
            addons. You can change your selection any time in the settings.
          </span>

          <Button
            type={ButtonType.Neutral}
            onClick={() => {
              settings.set(`mainSettings.simulator.${Simulators.Msfs2020}.enabled`, true);
              ipcRenderer.send(channels.window.reload);
            }}
          >
            Microsoft Flight Simulator 2020
          </Button>
          <Button
            type={ButtonType.Neutral}
            onClick={() => {
              settings.set(`mainSettings.simulator.${Simulators.Msfs2024}.enabled`, true);
              ipcRenderer.send(channels.window.reload);
            }}
          >
            Microsoft Flight Simulator 2024
          </Button>
        </>
      );
    }
    // Linux's error goes first because it may interfere with the other dir checkers
    if (os.platform().toString() === 'linux') {
      if (msfs2020BasePathError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install currently. Please set the correct location for the MSFS 2020
              base path before we can continue. It is usually located somewhere here:
              <br />
              ~/.local/share/Steam/steamapps/compatdata/&lt;APPID&gt;/pfx/drive_c/users/steamuser/AppData/Microsoft
              Flight Simulator/
            </span>

            <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2020)}>
              Select Path
            </Button>
            <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2020)}>
              I don&apos;t have Microsoft Flight Simulator 2020 installed
            </Button>
          </>
        );
      }
      if (msfs2024BasePathError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install currently. Please set the correct location for the MSFS 2024
              base path before we can continue. It is usually located somewhere here:
              <br />
              ~/.local/share/Steam/steamapps/compatdata/&lt;APPID&gt;/pfx/drive_c/users/steamuser/AppData/Microsoft
              Flight Simulator 2024/
            </span>

            <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2024)}>
              Select Path
            </Button>
            <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2024)}>
              I don&apos;t have Microsoft Flight Simulator 2024 installed
            </Button>
          </>
        );
      }
      if (msfs2020installLocationError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install location (community folder) currently. Please set the correct
              location before we can continue.
            </span>

            <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2020)}>
              Select Path
            </Button>
          </>
        );
      }
      if (msfs2024installLocationError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install location (community folder) currently. Please set the correct
              location before we can continue.
            </span>

            <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2024)}>
              Select Path
            </Button>
          </>
        );
      }
    }
    if (msfs2020BasePathError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">
            We couldn&apos;t determine the correct MSFS 2020 base path. Would you please help us? <br /> <br />
            It is usually located somewhere here: <br />
            &quot;%LOCALAPPDATA%\Packages\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache&quot; <br /> <br /> or
            here: <br /> &quot;%APPDATA%\Microsoft Flight Simulator\&quot;
          </span>

          <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2020)}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2020)}>
            I don&apos;t have Microsoft Flight Simulator 2020 installed
          </Button>
        </>
      );
    }
    if (msfs2024BasePathError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">
            We couldn&apos;t determine the correct MSFS 2024 base path. Would you please help us? <br /> <br />
            It is usually located somewhere here: <br />
            &quot;%LOCALAPPDATA%\Packages\Microsoft.Limitless_8wekyb3d8bbwe\LocalCache&quot; <br /> <br />
            or here: <br /> &quot;%APPDATA%\Microsoft Flight Simulator 2024\&quot;
          </span>

          <Button type={ButtonType.Neutral} onClick={() => handleSelectSimulatorBasePath(Simulators.Msfs2024)}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => handleSimulatorNotInstalled(Simulators.Msfs2024)}>
            I don&apos;t have Microsoft Flight Simulator 2024 installed
          </Button>
        </>
      );
    }
    if (msfs2020installLocationError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your MSFS 2020 Community folder is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation(Simulators.Msfs2020)}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn&apos;t find it there. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2020)}>
            Select Path
          </Button>
        </>
      );
    }
    if (msfs2024installLocationError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your MSFS 2024 Community folder is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation(Simulators.Msfs2024)}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn&apos;t find it there. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={() => handleSelectInstallPath(Simulators.Msfs2024)}>
            Select Path
          </Button>
        </>
      );
    }
    if (tempLocationError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your loation for temporary folders is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {settings.get('mainSettings.tempLocation')}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn&apos;t find it there. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={() => handleSelectTempLocation()}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={() => resetTempLocation()}>
            Reset
          </Button>
        </>
      );
    }
    return <></>;
  };

  if (
    noSimInstalled ||
    msfs2020installLocationError ||
    msfs2024installLocationError ||
    msfs2020BasePathError ||
    msfs2024BasePathError ||
    tempLocationError
  ) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
        <span className="text-5xl font-semibold">Something went wrong.</span>
        {content()}
      </div>
    );
  }
  return <></>;
};
