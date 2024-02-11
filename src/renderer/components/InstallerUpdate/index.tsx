import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import * as path from 'path';
import channels from 'common/channels';

type IpcCallback = Parameters<(typeof ipcRenderer)['on']>[1];

enum UpdateState {
  Standby,
  DownloadingUpdate,
  RestartToUpdate,
}

export const InstallerUpdate = (): JSX.Element => {
  const [updateState, setUpdateState] = useState(UpdateState.Standby);

  const updateNeeded = updateState !== UpdateState.Standby;

  let buttonText;
  switch (updateState) {
    case UpdateState.Standby:
      buttonText = '';
      break;
    case UpdateState.DownloadingUpdate:
      buttonText = 'Downloading update';
      break;
    case UpdateState.RestartToUpdate:
      buttonText = 'Restart to update';
      break;
  }

  useEffect(() => {
    const updateErrorHandler: IpcCallback = (_, args) => {
      console.error('Update error', args);
    };

    const updateAvailableHandler: IpcCallback = () => {
      console.log('Update available');

      setUpdateState(UpdateState.DownloadingUpdate);
    };

    const updateDownloadedHandler: IpcCallback = (_, args) => {
      console.log('Update downloaded', args);

      setUpdateState(UpdateState.RestartToUpdate);

      Notification.requestPermission()
        .then(() => {
          console.log('Showing Update notification');
          new Notification('Restart to update!', {
            icon: path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'An update to the installer has been downloaded',
          });
        })
        .catch((e) => console.log(e));
    };

    ipcRenderer.on(channels.update.error, updateErrorHandler);
    ipcRenderer.on(channels.update.available, updateAvailableHandler);
    ipcRenderer.on(channels.update.downloaded, updateDownloadedHandler);

    return () => {
      ipcRenderer.off(channels.update.error, updateErrorHandler);
      ipcRenderer.off(channels.update.available, updateAvailableHandler);
      ipcRenderer.off(channels.update.downloaded, updateDownloadedHandler);
    };
  }, []);

  return (
    <div
      className={`z-50 flex h-full cursor-pointer items-center justify-center place-self-start bg-yellow-500 px-4 transition duration-200 hover:bg-yellow-600 ${
        updateNeeded ? 'visible' : 'hidden'
      }`}
      onClick={() => {
        if (updateState === UpdateState.RestartToUpdate) {
          ipcRenderer.send('restartAndUpdate');
        }
      }}
    >
      <div className="text-lg font-semibold text-white">{buttonText}</div>
    </div>
  );
};
