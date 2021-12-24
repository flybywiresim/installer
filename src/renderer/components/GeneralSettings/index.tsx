import React, { FC } from 'react';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import * as packageInfo from '../../../../package.json';
import { Toggle } from '@flybywiresim/react-components';
import settings, { useSetting } from "common/settings";
import { shell } from "electron";
import path from "path";
import * as fs from "fs";
import { useAppDispatch } from "renderer/redux/store";
import { callChangelog } from "renderer/redux/features/changelog";
import { ipcRenderer } from 'electron';

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

const InstallPathSettingItem = ({ value, setValue }: SettingItemProps<string>): JSX.Element => {
    const handleClick = async () => {
        const path = await setupInstallPath();

        if (path) {
            setValue(path);
        }
    };

    return (
        <SettingsItem name="Install Directory">
            <div className="text-white hover:text-gray-400 cursor-pointer underline transition duration-200" onClick={handleClick}>{value}</div>
        </SettingsItem>
    );
};

const AutoStartSettingItem = ({ value, setValue }: SettingItemProps<boolean>) => {
    const handleClick = () => {
        const newState = !value;
        setValue(newState);
        settings.set('mainSettings.autoStartApp', newState);
        ipcRenderer.send('request-startup-at-login-changed', newState);
    };

    return (
        <SettingsItem name="Automatically Start Application on Login">
            <Toggle
                value={value}
                onToggle={handleClick}
            />
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
            <Toggle
                value={value}
                onToggle={handleClick}
            />
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
            <Toggle
                value={value}
                onToggle={handleClick}
            />
        </SettingsItem>
    );
};

const DateLayoutItem = ({ value, setValue }: SettingItemProps<string>) => {
    const handleSelect = (value: string) => {
        settings.set('mainSettings.dateLayout', value);
        setValue(value);
    };

    return (
        <SettingsItem name="Date Layout">
            <select
                value={value}
                onChange={event => handleSelect(event.currentTarget.value)}
                name="Date Layout"
                className="text-base text-white w-60 rounded-md outline-none bg-navy border-2 border-navy px-2 cursor-pointer"
            >
                <option value={'yyyy/mm/dd'}>YYYY/MM/DD</option>
                <option value={'mm/dd/yyyy'}>MM/DD/YYYY</option>
                <option value={'dd/mm/yyyy'}>DD/MM/YYYY</option>
            </select>
        </SettingsItem>
    );
};

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
    const [installPath, setInstallPath] = useSetting<string>('mainSettings.msfsPackagePath');
    const [disableVersionWarning, setDisableVersionWarning] = useSetting<boolean>('mainSettings.disableExperimentalWarning');
    const [useCdnCache, setUseCdnCache] = useSetting<boolean>('mainSettings.useCdnCache');
    const [useDarkTheme, setUseDarkTheme] = useSetting<boolean>('mainSettings.useDarkTheme');
    const [seasonalEffects, setSeasonalEffects] = useSetting<boolean>('mainSettings.allowSeasonalEffects');
    const [dateLayout, setDateLayout] = useSetting<string>('mainSettings.dateLayout');
    const [autoStart, setAutoStart] = useSetting<boolean>('mainSettings.autoStartApp');

    const dispatch = useAppDispatch();

    const showChangelog = () => {
        dispatch(callChangelog({ showChangelog: true }));
    };

    const openThirdPartyLicenses = () => {
        const licensesPath = path.join(process.resourcesPath, 'extraResources', 'licenses.md');

        if (!fs.existsSync(licensesPath)) {
            alert('The requested file does not exist.');
            return;
        }

        shell.openExternal(licensesPath)
            .catch(console.error);
    };

    const handleReset = async () => {
        settings.reset('mainSettings' as never);

        // Workaround to flush the defaults
        settings.set('metaInfo.lastVersion', packageInfo.version);
    };

    return (
        <div>
            <div className="flex flex-col">
                <h2 className="text-white">General Settings</h2>
                <div className="flex flex-col divide-y divide-gray-600">
                    <InstallPathSettingItem value={installPath} setValue={setInstallPath} />
                    <AutoStartSettingItem value={autoStart} setValue={setAutoStart} />
                    <DisableWarningSettingItem value={disableVersionWarning} setValue={setDisableVersionWarning} />
                    <UseCdnSettingItem value={useCdnCache} setValue={setUseCdnCache} />
                    <DarkThemeItem value={useDarkTheme} setValue={setUseDarkTheme} />
                    <SeasonalEffectsItem value={seasonalEffects} setValue={setSeasonalEffects} />
                    <DateLayoutItem value={dateLayout} setValue={setDateLayout} />
                </div>
            </div>
            <div className="flex flex-row justify-between mt-6">
                <div className="flex flex-row justify-start gap-3">
                    <div
                        className="text-gray-600 hover:text-gray-700 cursor-pointer"
                        onClick={showChangelog}
                    >
                        v{packageInfo.version}
                    </div>
                    <h6 className="text-gray-600">|</h6>
                    <div
                        className="text-gray-600 hover:text-gray-700 cursor-pointer"
                        onClick={openThirdPartyLicenses}
                    >
                        Third party licenses</div>
                </div>
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
