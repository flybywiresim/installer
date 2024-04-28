import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSetting } from 'renderer/rendererSettings';

const SettingsItem: FC<{ name: string }> = ({ name, children }) => (
  <div className="flex flex-row items-center justify-between py-3.5">
    <p className="m-0">{name}</p>
    {children}
  </div>
);

export const DeveloperSettings = (): JSX.Element => {
  const [configDownloadUrl, setConfigDownloadUrl] = useSetting<string>('mainSettings.configDownloadUrl');
  const [configDownloadUrlValid, setConfigDownloadUrlValid] = useState<boolean>(false);

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
            <div className="flex flex-row items-center justify-between py-4 text-white">
              <input
                className={` text-right text-xl ${configDownloadUrlValid ? 'text-green-500' : 'text-red-500'}`}
                value={configDownloadUrl}
                type="url"
                onChange={(event) => setConfigDownloadUrl(event.target.value)}
                onBlur={() => validateUrl()}
                size={50}
              />
            </div>
          </SettingsItem>
        </div>
      </div>
    </div>
  );
};
