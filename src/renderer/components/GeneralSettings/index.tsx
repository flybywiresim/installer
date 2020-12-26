import React, { useEffect, useState } from 'react';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { Container, PageTitle, SettingItemContent, SettingItemName, SettingsItem, SettingsItems, SettingButton } from './styles';
import { NXApi } from "@flybywiresim/api-client";

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

function ApiReleaseSettingItem() {
    const [isOnProduction, setIsOnProduction] = useState(true);

    useEffect(() => setIsOnProduction(settings.get('mainSettings.apiRelease') === 'true'), []);

    function handleClick() {
        const isOnProduction = settings.get('mainSettings.apiRelease') === 'production';
        settings.set('mainSettings.apiRelease', isOnProduction ? 'staging' : 'production');

        NXApi.url = new URL(isOnProduction ? 'https://api.flybywiresim.com' : 'https://api.staging.flybywiresim.com');

        setIsOnProduction(isOnProduction);
    }

    return (
        <SettingsItem>
            <SettingItemName>API version</SettingItemName>
            <SettingButton onClick={handleClick}>{isOnProduction ? 'Production' : 'Staging'}</SettingButton>
        </SettingsItem>
    );
}

function ClearCacheSettingItem() {
    function handleClick() {
        for (const key in localStorage) {
            if (/data_cache_.+/.test(key)) {
                localStorage.removeItem(key);
            }
        }
    }

    return (
        <SettingsItem>
            <SettingItemName>Cache</SettingItemName>
            <SettingButton onClick={handleClick}>Clear</SettingButton>
        </SettingsItem>
    );
}

function index(): JSX.Element {
    return (
        <Container>
            <PageTitle>General Settings</PageTitle>
            <SettingsItems>
                <InstallPathSettingItem />
                <ApiReleaseSettingItem />
                <ClearCacheSettingItem />
            </SettingsItems>
        </Container>
    );
}

export default index;
