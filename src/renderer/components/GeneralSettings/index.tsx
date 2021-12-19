import React from 'react';
import { setupInstallPath, setupLiveriesPath } from 'renderer/actions/install-path.utils';
import {
    Container,
    PageTitle,
    SettingItemContent,
    SettingItemName,
    SettingsItem,
    SettingsItems,
    InfoButton,
    ResetButton,
} from './styles';
import * as packageInfo from '../../../../package.json';
import { Toggle } from '@flybywiresim/react-components';
import settings, { useSetting } from "common/settings";
import { Directories } from "renderer/utils/Directories";
import { shell } from "electron";
import path from "path";
import * as fs from "fs";
import { useAppDispatch } from "renderer/redux/store";
import { callChangelog } from "renderer/redux/features/changelog";

const InstallPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
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
};

const LiveriesPathSettingItem = (props: { path: string, setPath: (path: string) => void }): JSX.Element => {
    async function handleClick() {
        const path = await setupLiveriesPath();

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
        props.setLiveriesPath(Directories.community());
        const newState = !props.separateLiveriesPath;
        props.setSeperateLiveriesPath(newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"/>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Separate Liveries Directory</span>
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
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disableExperimentalWarning', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"/>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Disable Version Warnings</span>
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
    const handleClick = () => {
        const newState = !props.useCdnCache;
        props.setUseCdnCache(newState);
        settings.set('mainSettings.useCdnCache', newState);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"/>
            <div className="flex items-center mb-3.5 mt-3.5">
                <span className="text-base">Use CDN Cache (Faster Downloads)</span>
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

const DateLayoutItem = (props: {dateLayout: string, setDateLayout: CallableFunction}) => {
    const handleSelect = (value: string) => {
        settings.set('mainSettings.dateLayout', value);
        props.setDateLayout(value);
    };

    return (
        <>
            <div className="h-0.5 bg-gray-700"/>
            <div className="flex flex-row justify-between mb-3.5 mt-3.5 mr-2">
                <SettingItemName>{'Date Layout'}</SettingItemName>
                <select
                    value={props.dateLayout}
                    onChange={event => handleSelect(event.currentTarget.value)}
                    name="Date Layout"
                    id="datelayout-list"
                    className="text-base text-white w-60 rounded-md outline-none bg-navy border-2 border-navy px-2 cursor-pointer"
                >
                    <option value={'yyyy/mm/dd'}>YYYY/MM/DD</option>
                    <option value={'mm/dd/yyyy'}>MM/DD/YYYY</option>
                    <option value={'dd/mm/yyyy'}>DD/MM/YYYY</option>
                </select>
            </div>
        </>
    );
};

function index(): JSX.Element {
    const [installPath, setInstallPath] = useSetting<string>('mainSettings.msfsPackagePath');
    const [separateLiveriesPath, setSeparateLiveriesPath] = useSetting<boolean>('mainSettings.separateLiveriesPath');
    const [liveriesPath, setLiveriesPath] = useSetting<string>('mainSettings.liveriesPath');
    const [disableVersionWarning, setDisableVersionWarning] = useSetting<boolean>('mainSettings.disableExperimentalWarning');
    const [useCdnCache, setUseCdnCache] = useSetting<boolean>('mainSettings.useCdnCache');
    const [dateLayout, setDateLayout] = useSetting<string>('mainSettings.dateLayout');

    const handleReset = async () => {
        settings.reset('mainSettings' as never);

        // Workaround to flush the defaults
        settings.set('metaInfo.lastVersion', packageInfo.version);
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
                    <UseCdnSettingItem useCdnCache={useCdnCache} setUseCdnCache={setUseCdnCache} />
                    <DateLayoutItem dateLayout={dateLayout} setDateLayout={setDateLayout} />
                </SettingsItems>
            </Container>
            <div className="flex flex-row justify-between pr-4">
                <div className="flex flex-row justify-start gap-3">
                    <InfoButton onClick={showChangelog}>v{packageInfo.version}</InfoButton>
                    <h6 className="mt-6 text-gray-600">|</h6>
                    <InfoButton onClick={openThirdPartyLicenses}>Third party licenses</InfoButton>
                </div>
                <ResetButton onClick={handleReset}>Reset settings to default</ResetButton>
            </div>
        </>
    );
}

const showChangelog = () => {
    const dispatch = useAppDispatch();
    dispatch(callChangelog({ showChangelog: true }));
};

const openThirdPartyLicenses = () => {
    const licensesPath = path.join(process.resourcesPath, 'extraResources', 'licenses.md');

    if (!fs.existsSync(licensesPath)) {
        alert('The requested file does not exist.');
        return;
    }

    shell.openExternal(licensesPath)
        .catch(console.error);
};

export default index;
