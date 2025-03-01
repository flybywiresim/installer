import React, { useState } from 'react';
import { setupInstallPath, setupSimulatorBasePath, defaultCommunityDir } from 'renderer/actions/install-path.utils';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import * as fs from 'fs';
import { Button, ButtonType } from 'renderer/components/Button';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';

export const ErrorModal = (): JSX.Element => {
  const [msfs2020BasePathError] = useState<boolean>(
    (!fs.existsSync(Directories.simulatorBasePath(Simulators.Msfs2020)) &&
      Directories.simulatorBasePath(Simulators.Msfs2020) !== 'notInstalled') ||
      Directories.simulatorBasePath(Simulators.Msfs2020) === 'C:\\',
  );
  const [msfs2024BasePathError] = useState<boolean>(
    (!fs.existsSync(Directories.simulatorBasePath(Simulators.Msfs2024)) &&
      Directories.simulatorBasePath(Simulators.Msfs2024) !== 'notInstalled') ||
      Directories.simulatorBasePath(Simulators.Msfs2024) === 'C:\\',
  );
  const [msfs2020installLocationError] = useState<boolean>(
    !fs.existsSync(Directories.installLocation(Simulators.Msfs2020)) ||
      Directories.installLocation(Simulators.Msfs2020) === 'C:\\' ||
      !fs.existsSync(Directories.communityLocation(Simulators.Msfs2020)) ||
      !fs.existsSync(Directories.tempLocation(Simulators.Msfs2020)),
  );
  const [msfs2024installLocationError] = useState<boolean>(
    !fs.existsSync(Directories.installLocation(Simulators.Msfs2024)) ||
      Directories.installLocation(Simulators.Msfs2024) === 'C:\\' ||
      !fs.existsSync(Directories.communityLocation(Simulators.Msfs2024)) ||
      !fs.existsSync(Directories.tempLocation(Simulators.Msfs2020)),
  );

  const handleSelectSimulatorBasePath = async (sim: TypeOfSimulator) => {
    const path = await setupSimulatorBasePath(sim);
    if (path) {
      const communityDir = defaultCommunityDir(path);
      settings.set(`mainSettings.simulator.${sim}.communityPath`, communityDir);
      settings.set(`mainSettings.simulator.${sim}.installPath`, communityDir);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleSelectInstallPath = async (sim: TypeOfSimulator) => {
    const path = await setupInstallPath(sim);
    if (path) {
      settings.set(`mainSettings.simulator.${sim}.communityPath`, path);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleSimulatorNotInstalled = (sim: TypeOfSimulator) => {
    settings.set(`'mainSettings.simulator.${sim}.basePath'`, 'notInstalled');
    ipcRenderer.send(channels.window.reload);
  };

  const content = (): JSX.Element => {
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
            Select
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
            Select
          </Button>
        </>
      );
    }
    return <></>;
  };

  if (msfs2020installLocationError || msfs2024installLocationError || msfs2020BasePathError || msfs2024BasePathError) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
        <span className="text-5xl font-semibold">Something went wrong.</span>
        {content()}
      </div>
    );
  }
  return <></>;
};
