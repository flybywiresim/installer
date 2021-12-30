import React, { FC } from 'react';
import * as packageInfo from '../../../../package.json';
import { Toggle } from '@flybywiresim/react-components';
import settings, { useSetting } from "common/settings";

const SettingsItem: FC<{name: string}> = ({ name, children }) => (
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

const DarkThemeItem = ({ value, setValue }: SettingItemProps<boolean>) => {
    const handleClick = () => {
        const newState = !value;
        setValue(newState);
        settings.set('mainSettings.useDarkTheme', newState);
    };

    return (
        <SettingsItem name="Dark Theme">
            <Toggle
                value={value}
                onToggle={handleClick}
            />
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
            <Toggle
                value={value}
                onToggle={handleClick}
            />
        </SettingsItem>
    );
};

const index = (): JSX.Element => {
    const [useDarkTheme, setUseDarkTheme] = useSetting<boolean>('mainSettings.useDarkTheme');
    const [seasonalEffects, setSeasonalEffects] = useSetting<boolean>('mainSettings.allowSeasonalEffects');

    const handleReset = async () => {
        settings.reset('mainSettings' as never);

        // Workaround to flush the defaults
        settings.set('metaInfo.lastVersion', packageInfo.version);
    };

    return (
        <div>
            <div className="flex flex-col">
                <h2 className="text-white">Customization Settings</h2>
                <div className="flex flex-col divide-y divide-gray-600">
                    <DarkThemeItem value={useDarkTheme} setValue={setUseDarkTheme} />
                    <SeasonalEffectsItem value={seasonalEffects} setValue={setSeasonalEffects} />
                </div>
            </div>
            <div className="flex flex-row justify-end mt-6">
                <div
                    className="flex items-center justify-center px-2 py-1 text-white bg-red-600 hover:bg-red-700 cursor-pointer transition duration-200 rounded-md"
                    onClick={handleReset}
                >
                    Reset settings to default
                </div>
            </div>
        </div>
    );
};

export default index;
