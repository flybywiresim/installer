import React, { useState } from 'react';
import { remote } from 'electron';
import Store from 'electron-store';
import { Container, PageTitle, SettingItemContent, SettingItemName, SettingsItem, SettingsItems, SettingButton } from './styles';

function InstallPathSettingItem(): JSX.Element {
    const settings = new Store;
    const [installPath, setInstallPath] = useState(settings.get('mainSettings.msfsPackagePath'));

    async function handleClick() {
        const path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (path.filePaths[0]) {
            setInstallPath(path.filePaths[0]);
            settings.set('mainSettings.msfsPackagePath', installPath);
        }
    }

    return (
        <SettingsItem>
            <SettingItemName>Install Directory</SettingItemName>
            <SettingItemContent>{installPath}</SettingItemContent>
            <SettingButton onClick={handleClick}>Modify</SettingButton>
        </SettingsItem>
    );
}

function index(): JSX.Element {
    return (
        <Container>
            <PageTitle>General Settings</PageTitle>
            <SettingsItems>
                <InstallPathSettingItem />
            </SettingsItems>
        </Container>
    );
}

export default index;
