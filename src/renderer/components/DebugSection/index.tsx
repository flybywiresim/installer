import React, { useState } from 'react';
import path from 'path';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';

export const DebugSection = (): JSX.Element => {
  const [ipcMessage, setIpcMessage] = useState<string>(channels.window.minimize);

  const sendNotification = () => {
    Notification.requestPermission()
      .then(() => {
        console.log('Showing test notification');
        console.log(path.join(process.resourcesPath, 'extraResources', 'icon.ico'));
        new Notification('This is a test!', {
          icon: path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
          body: 'We did something that you should know about.',
        });
      })
      .catch((e) => console.log(e));
  };

  const sendIpcMessage = () => {
    ipcRenderer.send(ipcMessage);
  };

  return (
    <div className="py-8 pl-12">
      <h1 className="font-manrope font-bold text-white">Debug options</h1>

      <h3 className="text-white">Notifications</h3>
      <button className="bg-cyan p-3 font-bold" onClick={sendNotification}>
        Send test notification
      </button>

      <h3 className="mt-5 text-white">Send IPC message</h3>
      <div className="flex flex-row">
        <input
          value={ipcMessage}
          onChange={(event) => setIpcMessage(event.target.value)}
          className="p-1 outline-none"
        />
        <button className="bg-cyan p-3 font-bold" onClick={sendIpcMessage}>
          Send message
        </button>
      </div>
    </div>
  );
};
