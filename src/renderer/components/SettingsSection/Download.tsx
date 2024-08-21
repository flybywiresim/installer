import React, { FC } from 'react';
import { setupMsfsCommunityPath, setupInstallPath, setupTempLocation } from 'renderer/actions/install-path.utils';
import settings, { useSetting } from 'renderer/rendererSettings';
import { Toggle } from '../Toggle';

const SettingsItem: FC<{ name: string }> = ({ name, children }) => (
  <div className="flex flex-row items-center justify-between py-3.5">
    {/* TODO: Remove this styling later */}
    <p className="m-0">{name}</p>
    {children}
  </div>
);

interface SettingItemProps<T> {
  value: T;
  setValue: (value: T) => void;
}

interface PathSettingItemProps extends SettingItemProps<string> {
  name: string;
  callback: () => Promise<string>;
}

const PathSettingItem: React.FC<PathSettingItemProps> = ({ value, setValue, name, callback }) => {
  const handleClick = async () => {
    const path = await callback();

    if (path) {
      setValue(path);
    }
  };

  return (
    <SettingsItem name={name}>
      <div
        className="cursor-pointer text-xl text-white underline transition duration-200 hover:text-gray-400"
        onClick={handleClick}
      >
        {value}
      </div>
    </SettingsItem>
  );
};

const MsfsCommunityPathSettingItem = ({ value, setValue }: SettingItemProps<string>): JSX.Element => (
  <PathSettingItem
    value={value}
    setValue={setValue}
    name="MSFS Community Directory"
    callback={setupMsfsCommunityPath}
  />
);

const InstallPathSettingItem = ({ value, setValue }: SettingItemProps<string>): JSX.Element => (
  <PathSettingItem value={value} setValue={setValue} name="Install Directory" callback={setupInstallPath} />
);

const TempLocationSettingItem = ({ value, setValue }: SettingItemProps<string>): JSX.Element => (
  <PathSettingItem
    value={value}
    setValue={setValue}
    name="Location for temporary folders"
    callback={setupTempLocation}
  />
);

const SeparateTempLocationSettingItem = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = () => {
    const newState = !value;
    setValue(newState);
    settings.set('mainSettings.separateTempLocation', newState);
    settings.set('mainSettings.tempLocation', settings.get('mainSettings.installPath'));
  };

  return (
    <SettingsItem name="Separate location for temporary folders">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

const DisableWarningSettingItem = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = () => {
    const newState = !value;
    setValue(newState);
    settings.set('mainSettings.disableExperimentalWarning', newState);
  };

  return (
    <SettingsItem name="Disable Version Warnings">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

const UseCdnSettingItem = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = () => {
    const newState = !value;
    setValue(newState);
    settings.set('mainSettings.useCdnCache', newState);
  };

  return (
    <SettingsItem name="Use CDN Cache (Faster Downloads)">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

export const DownloadSettings = (): JSX.Element => {
  const [communityPath, setCommunityPath] = useSetting<string>('mainSettings.msfsCommunityPath');
  const [installPath, setInstallPath] = useSetting<string>('mainSettings.installPath');
  const [tempLocation, setTempLocation] = useSetting<string>('mainSettings.tempLocation');
  const [separateTempLocation, setSeparateTempLocation] = useSetting<boolean>('mainSettings.separateTempLocation');
  const [disableVersionWarning, setDisableVersionWarning] = useSetting<boolean>(
    'mainSettings.disableExperimentalWarning',
  );
  const [useCdnCache, setUseCdnCache] = useSetting<boolean>('mainSettings.useCdnCache');

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="text-white">Download Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <MsfsCommunityPathSettingItem value={communityPath} setValue={setCommunityPath} />
          <InstallPathSettingItem value={installPath} setValue={setInstallPath} />
          <SeparateTempLocationSettingItem value={separateTempLocation} setValue={setSeparateTempLocation} />
          {separateTempLocation && <TempLocationSettingItem value={tempLocation} setValue={setTempLocation} />}
          <DisableWarningSettingItem value={disableVersionWarning} setValue={setDisableVersionWarning} />
          <UseCdnSettingItem value={useCdnCache} setValue={setUseCdnCache} />
        </div>
      </div>
    </div>
  );
};
