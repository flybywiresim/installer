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

const settings = new Store;

type AutoUpdateSettingItemType = {
    enableAutoUpdate: boolean,
    setEnableAutoUpdate: CallableFunction,
}

// eslint-disable-next-line no-unused-vars
function InstallPathSettingItem(props: { path: string, setPath: (path: string) => void }): JSX.Element {
    async function handleClick() {
        const path = await setupInstallPath();

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
}

const AutoUpdateSettingItem = (props: AutoUpdateSettingItemType) => {
    const handleToggle = () => {
        const newState = !props.enableAutoUpdate;

        settings.set('mainSettings.autoUpdateMods', newState);
        props.setEnableAutoUpdate(newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Auto Update Mods</span>
            <input
                type="checkbox"
                checked={props.enableAutoUpdate}
                onChange={handleToggle}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

function index(): JSX.Element {
    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);
    const [enableAutoUpdate, setEnableAutoUpdate] = useState<boolean>(settings.get('mainSettings.autoUpdateMods') as boolean);

    const handleReset = async () => {
        settings.clear();
        setInstallPath(await configureInitialInstallPath());
    };

    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem
                        path={installPath}
                        setPath={setInstallPath}
                    />
                    <AutoUpdateSettingItem
                        enableAutoUpdate={enableAutoUpdate}
                        setEnableAutoUpdate={setEnableAutoUpdate}
                    />
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showchangelog}>{settings.get('metaInfo.currentVersion')}</InfoButton>
                <ResetButton onClick={handleReset}>Reset settings to default</ResetButton>
            </InfoContainer>
        </>
    );
}

function showchangelog() {
    const showchangelog = true;
    store.dispatch({ type: 'CHANGELOG', payload: {
        showchangelog
    } });
}

export default index;
