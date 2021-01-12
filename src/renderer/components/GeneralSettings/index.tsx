import React, { useState } from 'react';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { Container, PageTitle, SettingItemContent, SettingItemName, SettingsItem, SettingsItems, SettingButton } from './styles';
import styled from "styled-components";
import { colors } from "renderer/style/theme";

const settings = new Store;

function InstallPathSettingItem(): JSX.Element {
    const [installPath, setInstallPath] = useState(settings.get('mainSettings.msfsPackagePath'));

    async function handleClick() {
        const path = await setupInstallPath();

        if (path) {
            setInstallPath(path);
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

const VersionNumber = styled.h6`
  margin-top: 1.5em;
  color: ${colors.mutedText} !important;
`;

function index(): JSX.Element {
    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem />
                </SettingsItems>
            </Container>
            <VersionNumber>{settings.get('metaInfo.currentVersion')}</VersionNumber>
        </>
    );
}

export default index;
