import React from 'react';
import settings, { useSetting } from 'renderer/rendererSettings';
import { Toggle } from '../Toggle';
import { SettingItemProps, SettingsItem } from './General';

const DarkThemeItem = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = () => {
    const newState = !value;
    setValue(newState);
    settings.set('mainSettings.useDarkTheme', newState);
  };

  return (
    <SettingsItem name="Dark Theme">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

const SeasonalEffectsItem = ({ value, setValue }: SettingItemProps<boolean>) => {
  const handleClick = () => {
    const newState = !value;
    setValue(newState);
    settings.set('mainSettings.allowSeasonalEffects', newState);
  };

  return (
    <SettingsItem name="Seasonal Effects">
      <Toggle value={value} onToggle={handleClick} />
    </SettingsItem>
  );
};

export const CustomizationSettings = (): JSX.Element => {
  const [useDarkTheme, setUseDarkTheme] = useSetting<boolean>('mainSettings.useDarkTheme');
  const [seasonalEffects, setSeasonalEffects] = useSetting<boolean>('mainSettings.allowSeasonalEffects');

  return (
    <div>
      <div className="flex flex-col">
        <h2 className="text-white">Customization Settings</h2>
        <div className="flex flex-col divide-y divide-gray-600">
          <DarkThemeItem value={useDarkTheme} setValue={setUseDarkTheme} />
          <SeasonalEffectsItem value={seasonalEffects} setValue={setSeasonalEffects} />
        </div>
      </div>
    </div>
  );
};
