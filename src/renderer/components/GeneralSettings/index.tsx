import React, { useState } from 'react';
import store from '../../redux/store';
import Store from 'electron-store';
import { setupInstallPath, setupLiveriesPath } from 'renderer/actions/install-path.utils';
import {
    Container,
    PageTitle,
    SettingItemContent,
    SettingItemName,
    SettingsItem,
    SettingsItems,
    InfoContainer,
    InfoButton, ResetButton
} from './styles';
import { configureInitialInstallPath } from "renderer/settings";
import * as packageInfo from '../../../../package.json';
import * as actionTypes from '../../redux/actionTypes';
import { clearLiveries, reloadLiveries } from '../AircraftSection/LiveryConversion';
import { Toggle } from '@flybywiresim/react-components';

const settings = new Store;

// eslint-disable-next-line no-unused-vars
const InstallPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const path = await setupInstallPath();

        if (path) {
            props.setPath(path);
            if (settings.has('mainSettings.pathError')) {
                settings.delete('mainSettings.pathError');
            }
            if (!settings.get('mainSettings.separateLiveriesPath') && !settings.get('mainSettings.disabledIncompatibleLiveriesWarning')) {
                reloadLiveries();
            }
        }
    }

    return (
        <SettingsItem>
            <SettingItemName>Install Directory</SettingItemName>
            <SettingItemContent onClick={handleClick}>{props.path}</SettingItemContent>
        </SettingsItem>
    );
};
//once finished, this will allow users select any file to open (as of now this is NOT specific to MSFS.exe(s))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ExecutableInstallPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const inputElement = document.createElement("input");
        // Set its type to file
        inputElement.type = "file";

        inputElement.dispatchEvent(new MouseEvent("click"));
    }

    return (
        <SettingsItem>
            <SettingItemName>Executable Install Directory</SettingItemName>
            <SettingItemContent onClick={handleClick}>{props.path}</SettingItemContent>
        </SettingsItem>
    );
};

const LiveriesPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const path = await setupLiveriesPath();

        if (path) {
            props.setPath(path);
            if (!settings.get('mainSettings.disabledIncompatibleLiveriesWarning')) {
                reloadLiveries();
            }
        }
    }

    return (
        <SettingsItem>
            <SettingItemContent onClick={handleClick}>{props.path}</SettingItemContent>
        </SettingsItem>
    );
};

const SeparateLiveriesPathSettingItem = (props: {separateLiveriesPath: boolean, setSeperateLiveriesPath: CallableFunction, setLiveriesPath: CallableFunction}) => {
    const handleClick = () => {
        settings.set('mainSettings.liveriesPath', settings.get('mainSettings.msfsPackagePath'));
        props.setLiveriesPath(settings.get('mainSettings.msfsPackagePath'));
        const newState = !props.separateLiveriesPath;
        props.setSeperateLiveriesPath(newState);
        settings.set('mainSettings.separateLiveriesPath', newState);
        if (!settings.get('mainSettings.disabledIncompatibleLiveriesWarning')) {
            reloadLiveries();
        }
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Separate Liveries Directory</span>
                <div className="ml-auto">
                    <Toggle
                        value={props.separateLiveriesPath}
                        onToggle={handleClick}
                    />
                </div>
            </div>
        </>
    );
};

const DisableWarningSettingItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disableExperimentalWarning', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Disable Version Warnings</span>
                <div className="ml-auto">
                    <Toggle
                        value={props.disableWarning}
                        onToggle={handleClick}
                    />
                </div>
            </div>
        </>
    );
};

const DisableLiveryWarningItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', newState);
        if (!newState) {
            reloadLiveries();
        } else {
            clearLiveries();
        }
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Disable Incompatible Livery Warnings</span>
                <div className="ml-auto">
                    <Toggle
                        value={props.disableWarning}
                        onToggle={handleClick}
                    />
                </div>
            </div>
        </>
    );
};

const UseCdnSettingItem = (props: {useCdnCache: boolean, setUseCdnCache: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.useCdnCache;
        props.setUseCdnCache(newState);
        settings.set('mainSettings.useCdnCache', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Use CDN Cache (Faster Downloads)</span>
                <div className="ml-auto">
                    <Toggle
                        value={props.useCdnCache}
                        onToggle={handleClick}
                    />
                </div>
            </div>
        </>

    );
};

const DateLayoutItem = (props: {dateLayout: number, setDateLayout: CallableFunction}) => {
    const handleSelect = (value: string) => {
        settings.set('mainSettings.dateLayout', value);
        props.setDateLayout(value);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex flex-row justify-between mb-3.5 mt-3.5 mr-2">
                <SettingItemName>{'Date Layout'}</SettingItemName>
                <select
                    value={props.dateLayout}
                    onChange={event => handleSelect(event.currentTarget.value)}
                    name="Date Layout"
                    id="datelayout-list"
                    className="text-base text-white w-60 rounded-md outline-none bg-navy border-2 border-navy px-2 cursor-pointer"
                >
                    <option value={'yyyy/mm/dd'}>YYYY/MM/DD</option>
                    <option value={'mm/dd/yyyy'}>MM/DD/YYYY</option>
                    <option value={'dd/mm/yyyy'}>DD/MM/YYYY</option>
                </select>
            </div>
        </>
    );
};

function index(): JSX.Element {
    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);
    const [separateLiveriesPath, setSeparateLiveriesPath] = useState<boolean>(settings.get('mainSettings.separateLiveriesPath') as boolean);
    const [liveriesPath, setLiveriesPath] = useState<string>(settings.get('mainSettings.liveriesPath') as string);
    const [disableVersionWarning, setDisableVersionWarning] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);
    const [disableLiveryWarning, setDisableLiveryWarning] = useState<boolean>(settings.get('mainSettings.disabledIncompatibleLiveriesWarning') as boolean);
    const [useCdnCache, setUseCdnCache] = useState<boolean>(settings.get('mainSettings.useCdnCache') as boolean);
    const [dateLayout, setDateLayout] = useState<number>(settings.get('mainSettings.dateLayout') as number);

    const handleReset = async () => {
        settings.clear();
        settings.set('metaInfo.lastVersion', packageInfo.version);
        setInstallPath(await configureInitialInstallPath());
        setLiveriesPath(installPath);
        setSeparateLiveriesPath(false);
        settings.set('mainSettings.separateLiveriesPath', false);
        setDisableVersionWarning(false);
        settings.set('mainSettings.disableExperimentalWarning', false);
        setDisableLiveryWarning(false);
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', false);
        setUseCdnCache(true);
        settings.set('mainSettings.useCdnCache', true);
        setDateLayout(1);
        settings.set('mainSettings.dateLayout', 'yyyy/mm/dd');
        reloadLiveries();
    };

    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
                    <SeparateLiveriesPathSettingItem separateLiveriesPath={separateLiveriesPath} setSeperateLiveriesPath={setSeparateLiveriesPath} setLiveriesPath={setLiveriesPath} />
                    {separateLiveriesPath ? (<LiveriesPathSettingItem path={liveriesPath} setPath={setLiveriesPath} />) : (<></>)}
                    <DisableWarningSettingItem disableWarning={disableVersionWarning} setDisableWarning={setDisableVersionWarning} />
                    <DisableLiveryWarningItem disableWarning={disableLiveryWarning} setDisableWarning={setDisableLiveryWarning} />
                    <UseCdnSettingItem useCdnCache={useCdnCache} setUseCdnCache={setUseCdnCache} />
                    <DateLayoutItem dateLayout={dateLayout} setDateLayout={setDateLayout} />
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showChangelog}>v{packageInfo.version}</InfoButton>
                <ResetButton onClick={handleReset}>Reset settings to default</ResetButton>
            </InfoContainer>
        </>
    );
}

const showChangelog = () => {
    store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
        showChangelog: true
    } });
};

export default index;
