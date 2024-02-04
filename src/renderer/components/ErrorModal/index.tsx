import React, { useState } from 'react';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import settings from 'common/settings';
import { Directories } from 'renderer/utils/Directories';
import * as fs from 'fs';
import { Button, ButtonType } from 'renderer/components/Button';

export const ErrorModal = (): JSX.Element => {
  const [communityError, setCommunityError] = useState<boolean>(
    !fs.existsSync(Directories.installLocation()) || Directories.installLocation() === 'C:\\',
  );
  const [linuxError, setLinuxError] = useState<boolean>(Directories.installLocation() === 'linux');

  const handleClose = () => {
    setCommunityError(false);
    setLinuxError(false);
  };

  const handleSelectPath = async () => {
    const path = await setupInstallPath();
    if (path) {
      settings.set('mainSettings.liveriesPath', path);
      settings.set('mainSettings.separateLiveriesPath', false);
      handleClose();
    }
  };

  const content = (): JSX.Element => {
    // Linux's error goes first because it may interfere with the other dir checkers
    if (linuxError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Seems like you're using Linux</span>
          <span className="w-3/5 text-center text-2xl">
            We're unable to autodetect your install currently. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectPath}>
            Select
          </Button>
        </>
      );
    }
    if (communityError && Directories.installLocation() !== 'linux') {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your Community folder is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {Directories.installLocation()}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn't find it there. Please set the correct location before we can continue.
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectPath}>
            Select
          </Button>
        </>
      );
    }
    return <></>;
  };

  if (communityError || linuxError) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
        <span className="text-5xl font-semibold">Something went wrong.</span>
        {content()}
      </div>
    );
  }
  return <></>;
};
