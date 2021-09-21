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
import { useTranslation } from "react-i18next";
import { supportedLanguages } from '../../i18n/config';

const settings = new Store;

// eslint-disable-next-line no-unused-vars
const InstallPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    const { t } = useTranslation();

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
            <SettingItemName>{t('SettingsSection.DownloadSettings.InstallDirectory')}</SettingItemName>
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
    const { t } = useTranslation();
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
                <span className="text-base">{t('SettingsSection.DownloadSettings.SeparateLiveriesDirectory')}</span>
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
    const { t } = useTranslation();
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disableExperimentalWarning', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">{t('SettingsSection.GeneralSettings.DisableVersionWarnings')}</span>
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
    const { t } = useTranslation();
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
                <span className="text-base">{t('SettingsSection.GeneralSettings.DisableIncompatibleLiveryWarnings')}</span>
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
    const { t } = useTranslation();
    const handleClick = () => {
        const newState = !props.useCdnCache;
        props.setUseCdnCache(newState);
        settings.set('mainSettings.useCdnCache', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"></div>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">{t('SettingsSection.DownloadSettings.UseCDN')}</span>
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

const LanguageSettingsItem = () => {
    const { t, i18n } = useTranslation();
    const languageName = (element: string) => {
        if (t('LanguagesNative.' + element) === t('Languages.' + element)) {
            return t('Languages.' + element);
        } else {
            return t('LanguagesNative.' + element) + ' / ' + t('Languages.' + element);
        }
    };

    const languages: {value: string, name: string}[] = [];
    supportedLanguages.forEach(element => languages.push({ value: element, name: languageName(element) }));

    const handleSelect = (language: string) => {
        i18n.changeLanguage(language);
        settings.set('mainSettings.lang', language);
    };

    return (
        <div className="flex flex-row justify-between mt-1 mb-2 mr-2">
            <SettingItemName>{t('SettingsSection.GeneralSettings.Language')}</SettingItemName>
            <select
                value={i18n.language}
                onChange={event => handleSelect(event.currentTarget.value)}
                name="Language"
                id="language-list"
                className="text-base text-white w-60 rounded-md outline-none bg-navy border-2 border-navy px-2 cursor-pointer"
            >
                {languages.map(language =>
                    <option value={language.value} key={language.value}>{language.name}</option>)
                }
            </select>
        </div>
    );
};

function index(): JSX.Element {
    const { t, i18n } = useTranslation();

    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);
    const [separateLiveriesPath, setSeparateLiveriesPath] = useState<boolean>(settings.get('mainSettings.separateLiveriesPath') as boolean);
    const [liveriesPath, setLiveriesPath] = useState<string>(settings.get('mainSettings.liveriesPath') as string);
    const [disableVersionWarning, setDisableVersionWarning] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);
    const [disableLiveryWarning, setDisableLiveryWarning] = useState<boolean>(settings.get('mainSettings.disabledIncompatibleLiveriesWarning') as boolean);
    const [useCdnCache, setUseCdnCache] = useState<boolean>(settings.get('mainSettings.useCdnCache') as boolean);

    const handleReset = async () => {
        settings.clear();
        settings.set('metaInfo.lastVersion', packageInfo.version);
        await i18n.changeLanguage('en');
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
        reloadLiveries();
    };

    return (
        <>
            <Container>
                <PageTitle>{t('SettingsSection.GeneralSettings.Name')}</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
                    <SeparateLiveriesPathSettingItem separateLiveriesPath={separateLiveriesPath} setSeperateLiveriesPath={setSeparateLiveriesPath} setLiveriesPath={setLiveriesPath} />
                    {separateLiveriesPath ? (<LiveriesPathSettingItem path={liveriesPath} setPath={setLiveriesPath} />) : (<></>)}
                    <DisableWarningSettingItem disableWarning={disableVersionWarning} setDisableWarning={setDisableVersionWarning} />
                    <DisableLiveryWarningItem disableWarning={disableLiveryWarning} setDisableWarning={setDisableLiveryWarning} />
                    <UseCdnSettingItem useCdnCache={useCdnCache} setUseCdnCache={setUseCdnCache} />
                    <LanguageSettingsItem />
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showChangelog}>v{packageInfo.version}</InfoButton>
                <ResetButton onClick={handleReset}>{t('SettingsSection.GeneralSettings.ResetToDefault')}</ResetButton>
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
