import React, { useState } from 'react';
import { setupInstallPath, setupMsfsBasePath } from 'renderer/actions/install-path.utils';
import settings, { defaultCommunityDir } from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import * as fs from 'fs';
import { Button, ButtonType } from 'renderer/components/Button';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';

export const ErrorModal = (): JSX.Element => {
  const [msfsBasePathError] = useState<boolean>(
    (!fs.existsSync(Directories.msfsBasePath()) && Directories.msfsBasePath() !== 'notInstalled') ||
      Directories.msfsBasePath() === 'C:\\',
  );
  const [installLocationError] = useState<boolean>(
    !fs.existsSync(Directories.installLocation()) ||
      Directories.installLocation() === 'C:\\' ||
      !fs.existsSync(Directories.communityLocation()) ||
      !fs.existsSync(Directories.tempLocation()),
  );

  const handleSelectMsfsBasePath = async () => {
    const path = await setupMsfsBasePath();
    if (path) {
      const communityDir = defaultCommunityDir(path);
      settings.set('mainSettings.msfsCommunityPath', communityDir);
      settings.set('mainSettings.installPath', communityDir);
      settings.set('mainSettings.separateTempLocation', false);
      settings.set('mainSettings.tempLocation', communityDir);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleSelectInstallPath = async () => {
    const path = await setupInstallPath();
    if (path) {
      settings.set('mainSettings.msfsCommunityPath', path);
      settings.set('mainSettings.separateTempLocation', false);
      settings.set('mainSettings.tempLocation', path);
      ipcRenderer.send(channels.window.reload);
    }
  };

  const handleNoMSFS = () => {
    settings.set('mainSettings.msfsBasePath', 'notInstalled');
    ipcRenderer.send(channels.window.reload);
  };

  const content = (): JSX.Element => {
    // Linux's error goes first because it may interfere with the other dir checkers
    if (os.platform().toString() === 'linux') {
      if (msfsBasePathError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install currently. Please set the correct location for the MSFS base
              path before we can continue. It is usually located somewhere here:
              <br />
              ~/.local/share/Steam/steamapps/compatdata/&lt;APPID&gt;/pfx/drive_c/users/steamuser/AppData/Microsoft
              Flight Simulator/
            </span>

            <Button type={ButtonType.Neutral} onClick={handleSelectMsfsBasePath}>
              Select Path
            </Button>
            <Button type={ButtonType.Neutral} onClick={handleNoMSFS}>
              I don&apos;t have Microsoft Flight Simulator installed
            </Button>
          </>
        );
      }
      if (installLocationError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your install location (community folder) currently. Please set the correct
              location before we can continue.
            </span>

            <Button type={ButtonType.Neutral} onClick={handleSelectInstallPath}>
              Select Path
            </Button>
          </>
        );
      }
    }
    if (msfsBasePathError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">
            We couldn&apos;t determine the correct MSFS base path. Would you please help us? <br /> <br />
            It is usually located somewhere here: <br />
            &quot;%LOCALAPPDATA%\Packages\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache&quot; <br /> <br /> or
            here: <br /> &quot;%APPDATA%\Microsoft Flight Simulator\&quot;
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectMsfsBasePath}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={handleNoMSFS}>
            I don&apos;t have Microsoft Flight Simulator installed
          </Button>
        </>
      );
    }
    if (installLocationError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your Community folder is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation()}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn&apos;t find it there. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectInstallPath}>
            Select
          </Button>
        </>
      );
    }
    return <></>;
  };

  if (installLocationError || msfsBasePathError) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
        <span className="text-5xl font-semibold">Something went wrong.</span>
        {content()}
      </div>
    );
  }
  return <></>;
};
