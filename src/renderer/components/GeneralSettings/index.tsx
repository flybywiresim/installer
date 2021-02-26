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
import { connect, useDispatch } from "react-redux";
import { qaModeState } from "renderer/redux/types";
import { callQAMode } from "renderer/redux/actions/qaMode.actions";

const settings = new Store;

type QAInstallerSettingsItemType = {
    qaInstaller: boolean,
    dispatch: CallableFunction,
}

type IndexProps = {
    qaMode: boolean,
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

const QAInstallerSettingsItem = (props: QAInstallerSettingsItemType) => {
    async function handleClick() {
        props.dispatch(callQAMode(!props.qaInstaller));
        settings.set('mainSettings.qaInstaller', !props.qaInstaller);
    }

    return (
        <SettingsItem>
            <SettingItemName>QA Installer</SettingItemName>
            <SettingItemContent onClick={handleClick}>{props.qaInstaller ? 'On' : 'Off'}</SettingItemContent>
        </SettingsItem>
    );
};

const index = (props: IndexProps) => {
    const dispatch = useDispatch();

    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);

    const handleReset = async () => {
        settings.clear();
        setInstallPath(await configureInitialInstallPath());
    };

    return (
        <>
            <Container>
                <PageTitle>General Settings</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
                    <QAInstallerSettingsItem qaInstaller={props.qaMode} dispatch={dispatch}/>
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showchangelog}>{settings.get('metaInfo.currentVersion')}</InfoButton>
                <ResetButton onClick={handleReset}>Reset settings to default</ResetButton>
            </InfoContainer>
        </>
    );
};

function showchangelog() {
    const showchangelog = true;
    store.dispatch({ type: 'CHANGELOG', payload: {
        showchangelog
    } });
}

export default connect((state: { qaMode: qaModeState }) => ({ ...state.qaMode, }))(index);
