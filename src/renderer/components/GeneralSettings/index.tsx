import React, { useState } from 'react';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import {
    Container,
    PageTitle,
    SettingButton,
    SettingItemContent,
    SettingItemName,
    SettingsItem,
    SettingsItems
} from './styles';
import styled from "styled-components";
import { colors } from "renderer/style/theme";
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
            <SettingItemContent>{props.path}</SettingItemContent>
            <SettingButton onClick={handleClick}>Modify</SettingButton>
        </SettingsItem>
    );
}

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  padding-right: .55em;
`;

const InfoItem = styled.h6`
  margin-top: 1.5em;
  color: ${colors.mutedText} !important;
  
  cursor: pointer;
`;

function index(): JSX.Element {
    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);

    const handleReset = async () => setInstallPath(await configureInitialInstallPath());

    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoItem>{settings.get('metaInfo.currentVersion')}</InfoItem>
                <InfoItem onClick={handleReset}>Reset</InfoItem>
            </InfoContainer>
        </>
    );
}

export default index;
