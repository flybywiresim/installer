import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSetting } from 'renderer/rendererSettings';
import { Toggle } from 'renderer/components/Toggle';
import * as packageInfo from '../../../../package.json';
import { Button, ButtonType } from 'renderer/components/Button';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';

const SettingsItem: FC<{ name: string }> = ({ name, children }) => (
  <div className="flex flex-row items-center justify-between py-3.5">
    <p className="m-0">{name}</p>
    {children}
  </div>
);

export const DeveloperSettings: React.FC = () => {
  const [configDownloadUrl, setConfigDownloadUrl] = useSetting<string>('mainSettings.configDownloadUrl');
  const [configDownloadUrlValid, setConfigDownloadUrlValid] = useState<boolean>(false);

  const [configForceUseLocal, setConfigForceUseLocal] = useSetting<boolean>('mainSettings.configForceUseLocal');

  const validateUrl = useCallback(() => {
    try {
      fetch(configDownloadUrl).then((response) => {
        setConfigDownloadUrlValid(response.status === 200);
      });
    } catch (e) {
      setConfigDownloadUrlValid(false);
    }
  }, [configDownloadUrl]);

  useEffect(() => {
    validateUrl();
  }, [validateUrl]);

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="text-white">General Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <SettingsItem name="Configuration Download URL">
            <div className="flex flex-row items-center justify-between py-2 text-white">
              <input
                className={` text-right text-xl ${configDownloadUrlValid ? 'text-green-500' : 'text-red-500'}`}
                value={configDownloadUrl}
                type="url"
                onChange={(event) => setConfigDownloadUrl(event.target.value)}
                onBlur={() => validateUrl()}
                size={50}
              />
              <Button
                type={ButtonType.Neutral}
                className="ml-2 h-fit min-h-10 text-lg"
                onClick={() => ipcRenderer.send(channels.window.reload)}
              >
                Reload Installer
              </Button>
              <Button
                type={ButtonType.Neutral}
                className="ml-2 h-fit min-h-10 text-lg"
                onClick={() => setConfigDownloadUrl(packageInfo.configUrls.production)}
              >
                Reset to default
              </Button>
            </div>
          </SettingsItem>
          <SettingsItem name="Force Use Local Configuration">
            <div className="flex flex-row items-center justify-between text-white">
              <Toggle value={configForceUseLocal} onToggle={setConfigForceUseLocal} />
            </div>
          </SettingsItem>
        </div>
      </div>
    </div>
  );
};
