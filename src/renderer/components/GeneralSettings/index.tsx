import React, { useState } from 'react';
import store from '../../redux/store';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import * as packageInfo from '../../../../package.json';
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

function index(): JSX.Element {
    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);

    const handleReset = async () => {
        settings.clear();
        const version = packageInfo.version;
        settings.set('metaInfo.currentVersion', version);
        setInstallPath(await configureInitialInstallPath());
    };

    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
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
