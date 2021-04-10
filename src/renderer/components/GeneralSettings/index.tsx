import React, { useState } from 'react';
import store from '../../redux/store';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
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

const settings = new Store;

// eslint-disable-next-line no-unused-vars
const InstallPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const path = await setupInstallPath('aircraft');

        if (path) {
            props.setPath(path);
        }
    }

    return (
        <SettingsItem>
            <SettingItemName>Install Directory</SettingItemName>
            <SettingItemContent onClick={handleClick}>{props.path}</SettingItemContent>
        </SettingsItem>
    );
};

const LiveriesPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const path = await setupInstallPath('liveries');

        if (path) {
            props.setPath(path);
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
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Separate Liveries Directory</span>
            <input
                type="checkbox"
                checked={props.separateLiveriesPath}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const DisableWarningSettingItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disableExperimentalWarning', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Disable Version Warnings</span>
            <input
                type="checkbox"
                checked={props.disableWarning}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const DisableLiveryWarningItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Disable Incompatible Livery Warnings</span>
            <input
                type="checkbox"
                checked={props.disableWarning}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const UseCdnSettingItem = (props: {useCdnCache: boolean, setUseCdnCache: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.useCdnCache;
        props.setUseCdnCache(newState);
        settings.set('mainSettings.useCdnCache', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Use CDN (Faster Downloads)</span>
            <input
                type="checkbox"
                checked={props.useCdnCache}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

function index(): JSX.Element {
    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);
    const [separateLiveriesPath, setSeparateLiveriesPath] = useState<boolean>(settings.get('mainSettings.separateLiveriesPath') as boolean);
    const [liveriesPath, setLiveriesPath] = useState<string>(settings.get('mainSettings.liveriesPath') as string);
    const [disableVersionWarning, setDisableVersionWarning] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);
    const [disableLiveryWarning, setDisableLiveryWarning] = useState<boolean>(settings.get('mainSettings.disabledIncompatibleLiveriesWarning') as boolean);
    const [useCdnCache, setUseCdnCache] = useState<boolean>(settings.get('mainSettings.useCdnCache') as boolean);

    const handleReset = async () => {
        settings.clear();
        setInstallPath(await configureInitialInstallPath('aircraft'));
        setLiveriesPath(await configureInitialInstallPath('liveries'));
        setSeparateLiveriesPath(false);
        settings.set('mainSettings.separateLiveriesPath', false);
        setDisableVersionWarning(false);
        settings.set('mainSettings.disableExperimentalWarning', false);
        setDisableLiveryWarning(false);
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', false);
        setUseCdnCache(true);
        settings.set('mainSettings.useCdnCache', true);
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
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showChangelog}>{packageInfo.version}</InfoButton>
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
