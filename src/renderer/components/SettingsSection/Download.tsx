import React, { FC } from 'react';
import { setupMsfsCommunityPath, setupInstallPath, setupTempLocation } from 'renderer/actions/install-path.utils';
import settings, { useSetting } from 'renderer/rendererSettings';
import { Toggle } from '../Toggle';
import { enabledSimulators, managedSim, nextSim, setManagedSim, Simulators } from 'renderer/utils/SimManager';

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

const TempLocationSettingItem = ({ value, setValue }: SettingItemProps<boolean>): JSX.Element => {
  const [tempLocation, setTempLocation] = useSetting<string>('mainSettings.tempLocation');
  const handleToggle = () => {
    setValue(!value);
    settings.set('mainSettings.separateTempLocation', !value);
  };

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-600">
        <SettingsItem name="Separate location for temporary folders">
          <Toggle value={value} onToggle={handleToggle} />
        </SettingsItem>
        {value && (
          <div className="flex flex-col divide-y divide-gray-600 pl-6">
            <PathSettingItem
              name="Location for temporary folders"
              value={tempLocation}
              setValue={setTempLocation}
              callback={setupTempLocation}
            />
          </div>
        )}
      </div>
    </>
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
  const [enabled, setEnabled] = useSetting<boolean>(`mainSettings.simulator.${sim}.enabled`);
  const [communityPath, setCommunityPath] = useSetting<string>(`mainSettings.simulator.${sim}.communityPath`);
  const [installPath, setInstallPath] = useSetting<string>(`mainSettings.simulator.${sim}.installPath`);

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-600">
        <SettingsItem name={'Microsoft Flight Simulator ' + version}>
          <Toggle
            value={enabled}
            onToggle={() => {
              Object.values(enabledSimulators()).length > 1 || !enabled ? setEnabled(!enabled) : null;
              managedSim() === sim ? setManagedSim(nextSim(sim)) : null;
            }}
          />
        </SettingsItem>
        {enabled && (
          <div className="flex flex-col divide-y divide-gray-600 pl-6">
            <PathSettingItem
              name="Community Directory"
              value={communityPath}
              setValue={setCommunityPath}
              callback={() => setupMsfsCommunityPath(sim)}
            />
            <PathSettingItem
              name="Install Directory"
              value={installPath}
              setValue={setInstallPath}
              callback={() => setupInstallPath(sim)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export const DownloadSettings = (): JSX.Element => {
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
          <TempLocationSettingItem value={separateTempLocation} setValue={setSeparateTempLocation} />
          <DisableWarningSettingItem value={disableVersionWarning} setValue={setDisableVersionWarning} />
          <UseCdnSettingItem value={useCdnCache} setValue={setUseCdnCache} />
        </div>
      </div>
    </div>
  );
};
