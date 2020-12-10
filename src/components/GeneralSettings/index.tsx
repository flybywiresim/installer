import React, { useState } from 'react';
import Store from 'electron-store';
import { Container, PageTitle, SettingItemContent, SettingItemName, SettingsItem, SettingsItems, SettingButton } from './styles';
import { setupInstallPath } from '../../actions/install-path.utils';

const settings = new Store;

function InstallPathSettingItem(): JSX.Element {
    const [installPath, setInstallPath] = useState(settings.get('mainSettings.msfsPackagePath'));

    async function handleClick() {
        const path = await setupInstallPath();
        setInstallPath(path);
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
