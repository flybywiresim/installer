import React from 'react';
import settings from 'main/mainSettings';
import { useSetting } from 'renderer/rendererSettings';
import { Toggle } from '../Toggle';
import { SettingItemProps, SettingsItem } from './General';

const DisableHardwareAcceleration = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = (value: boolean) => {
    settings.set('advanced.disableHardwareAcceleration', value);
    setValue(value);
  };

  return (
    <SettingsItem name="Disable Hardware Acceleration">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

const DisableGpuSandbox = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = (value: boolean) => {
    settings.set('advanced.disableGpuSandbox', value);
    setValue(value);
  };

  return (
    <SettingsItem name="Disable GPU Sandbox">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

const DisableSandbox = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = (value: boolean) => {
    settings.set('advanced.noSandbox', value);
    setValue(value);
  };

  return (
    <SettingsItem name="Disable Sandbox">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

export const AdvancedSettings = (): JSX.Element => {
  const [showAll] = useSetting<boolean>('advanced.showAll');
  const showAllSettings = showAll || process.env.NODE_ENV === 'development';
  const [disableHardwareAcceleration, setDisableHardwareAcceleration] = useSetting<boolean>(
    'advanced.disableHardwareAcceleration',
  );
  const [disableGpuSandbox, setDisableGpuSandbox] = useSetting<boolean>('advanced.disableGpuSandbox');
  const [disableSandbox, setDisableSandbox] = useSetting<boolean>('advanced.noSandbox');

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="text-red">Advanced Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <DisableHardwareAcceleration value={disableHardwareAcceleration} setValue={setDisableHardwareAcceleration} />
          {(disableGpuSandbox || showAllSettings) && (
            <DisableGpuSandbox value={disableGpuSandbox} setValue={setDisableGpuSandbox} />
          )}
          {(disableSandbox || showAllSettings) && (
            <DisableSandbox value={disableSandbox} setValue={setDisableSandbox} />
          )}
          <p className="text-red">It is required to restart the application to apply changes</p>
        </div>
      </div>
    </div>
  );
};
