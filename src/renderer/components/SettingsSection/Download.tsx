import React, { FC } from 'react';
import { setupMsfsCommunityPath, setupInstallPath, setupTempLocation } from 'renderer/actions/install-path.utils';
import settings, { useSetting } from 'renderer/rendererSettings';
import { Toggle } from '../Toggle';
import { Simulators } from 'renderer/utils/SimManager';

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

const MsfsSettings = ({ sim }: { sim: Simulators }): JSX.Element => {
  const version = sim.slice(-4);
  const [enabled, setEnabled] = useSetting<boolean>(`mainSettings.simulator.msfs${version}.enabled`);
  const [communityPath, setCommunityPath] = useSetting<string>(`mainSettings.simulator.msfs${version}.communityPath`);
  const [installPath, setInstallPath] = useSetting<string>(`mainSettings.simulator.msfs${version}.installPath`);

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-600">
        <SettingsItem name={'Microsoft Flight Simulator ' + version}>
          <Toggle value={enabled} onToggle={() => setEnabled(!enabled)} />
        </SettingsItem>
        {enabled && (
          <div className="flex flex-col divide-y divide-gray-600 pl-6">
            <PathSettingItem
              name="Community Directory"
              value={communityPath}
              setValue={setCommunityPath}
              callback={setupMsfsCommunityPath}
            />
            <PathSettingItem
              name="Install Directory"
              value={installPath}
              setValue={setInstallPath}
              callback={setupInstallPath}
            />
          </div>
        )}
      </div>
    </>
  );
};

export const DownloadSettings = (): JSX.Element => {
  const [tempLocation, setTempLocation] = useSetting<string>('mainSettings.tempLocation');
  const [separateTempLocation, setSeparateTempLocation] = useSetting<boolean>('mainSettings.separateTempLocation');
  const [disableVersionWarning, setDisableVersionWarning] = useSetting<boolean>(
    'mainSettings.disableExperimentalWarning',
  );
  const [useCdnCache, setUseCdnCache] = useSetting<boolean>('mainSettings.useCdnCache');

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="font-manrope font-bold text-white">Download Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <MsfsSettings sim={Simulators.Msfs2020} />
          <MsfsSettings sim={Simulators.Msfs2024} />
          <SeparateTempLocationSettingItem value={separateTempLocation} setValue={setSeparateTempLocation} />
          {separateTempLocation && <TempLocationSettingItem value={tempLocation} setValue={setTempLocation} />}
          <DisableWarningSettingItem value={disableVersionWarning} setValue={setDisableVersionWarning} />
          <UseCdnSettingItem value={useCdnCache} setValue={setUseCdnCache} />
        </div>
      </div>
    </div>
  );
};
