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
  const [qaConfigUrls, setQaConfigUrls] = useSetting<Record<number, string>>('mainSettings.qaConfigUrls');
  const [qaConfigUrlsValid, setQaConfigUrlsValid] = useState<Record<number, boolean>>({});

  const [configForceUseLocal, setConfigForceUseLocal] = useSetting<boolean>('mainSettings.configForceUseLocal');

  const validateUrls = useCallback(() => {
    // Validate main config URL
    if (configDownloadUrl) {
      fetch(configDownloadUrl)
        .then((response) => {
          setConfigDownloadUrlValid(response.status === 200);
        })
        .catch(() => {
          setConfigDownloadUrlValid(false);
        });
    } else {
      setConfigDownloadUrlValid(false);
    }

    // Validate QA config URLs
    qaConfigUrls &&
      Object.entries(qaConfigUrls).forEach(([key, url]) => {
        if (url) {
          fetch(url)
            .then((response) => {
              setQaConfigUrlsValid((prev) => ({ ...prev, [Number(key)]: response.status === 200 }));
            })
            .catch(() => {
              setQaConfigUrlsValid((prev) => ({ ...prev, [Number(key)]: false }));
            });
        } else {
          setQaConfigUrlsValid((prev) => ({ ...prev, [Number(key)]: false }));
        }
      });
  }, [configDownloadUrl, qaConfigUrls]);

  useEffect(() => {
    validateUrls();
  }, [validateUrls]);

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="font-manrope font-bold text-white">Developer Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <SettingsItem name="Configuration Download URL">
            <div className="flex flex-row items-center justify-between py-2 text-white">
              <input
                className={` text-right text-xl ${configDownloadUrlValid ? 'text-green-500' : 'text-red-500'}`}
                value={configDownloadUrl}
                type="url"
                onChange={(event) => setConfigDownloadUrl(event.target.value)}
                onBlur={() => validateUrls()}
                size={50}
              />
              <Button
                type={ButtonType.Neutral}
                className="ml-2 h-fit min-h-10 text-lg"
                onClick={() => setConfigDownloadUrl(packageInfo.configUrls.production)}
              >
                Reset to default
              </Button>
            </div>
          </SettingsItem>
          <SettingsItem name="QA Configuration URLs">
            <div className="flex flex-col gap-2 py-2 text-white">
              {Object.entries(qaConfigUrls).map(([key, url]) => (
                <div key={key} className="flex flex-row items-center gap-2">
                  <span className="w-8 text-center text-sm text-gray-400">#{key}</span>
                  <input
                    className={` text-right text-xl ${qaConfigUrlsValid[Number(key)] ? 'text-green-500' : 'text-red-500'}`}
                    value={url}
                    type="url"
                    onChange={(event) => setQaConfigUrls({ ...qaConfigUrls, [Number(key)]: event.target.value })}
                    size={40}
                  />
                  <Button
                    type={ButtonType.Neutral}
                    className="h-fit min-h-10 px-2 text-lg"
                    onClick={() => {
                      const newUrls = { ...qaConfigUrls };
                      delete newUrls[Number(key)];
                      setQaConfigUrls(newUrls);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex flex-row items-center gap-2">
                <Button
                  type={ButtonType.Neutral}
                  className="h-fit min-h-10 px-3 text-lg"
                  onClick={() => {
                    const nextKey = Math.max(0, ...Object.keys(qaConfigUrls).map(Number)) + 1;
                    setQaConfigUrls({ ...qaConfigUrls, [nextKey]: '' });
                  }}
                >
                  Add URL
                </Button>
                <Button
                  type={ButtonType.Neutral}
                  className="h-fit min-h-10 px-3 text-lg"
                  onClick={() => setQaConfigUrls({})}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </SettingsItem>
          <SettingsItem name="Force Use Local Configuration">
            <div className="flex flex-row items-center justify-between text-white">
              <Toggle value={configForceUseLocal} onToggle={setConfigForceUseLocal} />
            </div>
          </SettingsItem>
          <SettingsItem name="">
            <div className="flex w-full flex-row items-center justify-between text-white">
              <span className="text-sm text-red-500">All changes on this page require a reload to take effect</span>
              <Button
                type={ButtonType.Neutral}
                className="ml-2 h-fit min-h-10 text-lg"
                onClick={() => ipcRenderer.send(channels.window.reload)}
              >
                Reload Installer
              </Button>
            </div>
          </SettingsItem>
        </div>
      </div>
    </div>
  );
};
