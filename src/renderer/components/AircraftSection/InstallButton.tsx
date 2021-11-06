import React, { useState } from 'react';
import { DownloadItem } from 'renderer/redux/types';
import styled from 'styled-components';
import { InstallStatus } from '.';
import {
    BaseButton,
    ButtonContainer,
    StateText,
} from './styles';
import { DownloadOutlined } from '@ant-design/icons';
import { colors } from 'renderer/style/theme';

type InstallButtonProps = {
    installStatus: InstallStatus,
    handleInstall: () => void,
    handleCancel: () => void,
    uninstallAddon: () => void,
    hasBugReport: () => boolean,
    reportBug: () => void,
    hasFeatureRequest: () => boolean,
    requestFeature: () => void,
    download: DownloadItem,

}

export const InstallButtonComponent: React.FC<InstallButtonProps> = ({ installStatus, handleInstall, handleCancel, uninstallAddon, hasBugReport, reportBug, hasFeatureRequest, requestFeature, download }) => {
    const uninstall = 'uninstall';
    const bugReport = 'bugReport';
    const featureRequest = 'featureRequest';
    const InstallButtonTemplate = styled(props => <BaseButton
        type='primary'
        icon={<DownloadOutlined />}
        className={(props.backgroundHover)}
        {...props}
    >
        <div className='flex relative justify-center content-center pointer-events-auto' onMouseOver={() => {
            setHoverOverDropdown(false);
            setHoverOverButton(true);
        }}
        onMouseLeave={() => {
            setHoverOverButton(false);
        }}
        >
            <div className={(props.disabled ? 'pointer-events-disabled ' : 'cursor-pointer ') + (props.options && 'mr-5')} onClick={props.onClickAction}>{props.name}</div>
            {props.options && <div className={'right-0 absolute min-h-full opacity-50 w-0.5  bg-white'}></div>}
            {props.options && <div className={'cursor-pointer text-white -right-5.5 absolute'} onClick={toggleExtended}>{installButtonExtended ? '▴' : '▾'}</div>}
        </div>
        {installButtonExtended ? <div className='overflow-hidden pointer-events-auto'>
            <div onMouseLeave={() => {
                document.addEventListener('click', function handler() {
                    toggleExtended();
                    document.removeEventListener('click', handler);
                });
            }}
            onMouseOver={() => {
                setHoverOverDropdown(true);
                setHoverOverButton(false);
            }}
            className={`cursor-pointer absolute w-full right-0 text-white rounded-b-5px bg-${props.background}`}>
                <div className={'h-1.5 bg-' + (props.background) + ((hoverOverButton && !props.disabled) ? '-light' : '')}></div>
                <div className="h-px bg-white"></div>
                {props.options?.includes(uninstall) && <div className={'rounded-5px py-1 hover:bg-' + (props.background) + '-light'} onClick={() => {
                    uninstallAddon(); toggleExtended();
                }}>Uninstall</div>}
                {(props.options?.includes(bugReport) && hasBugReport()) && <div className={'rounded-5px py-1 hover:bg-' + (props.background) + '-light'} onClick={() => {
                    reportBug(); toggleExtended();
                }}>Report Bug</div>}
                {(props.options?.includes(featureRequest) && hasFeatureRequest()) && <div className={'rounded-5px py-1 hover:bg-' + (props.background) + '-light'} onClick={() => {
                    requestFeature(); toggleExtended();
                }}>Request Feature</div>}
            </div>
        </div> : <div></div>}
    </BaseButton>)`
        min-width: 114px;
        cursor: default;
        pointer-events: none;
        ${props => (props.options?.includes(featureRequest) ? 'min-width: 190px' : 'min-width: 114px')};
        borderColor: ${props => (colors[(props.background as keyof typeof colors)])};
        background: ${props => (colors[(props.background as keyof typeof colors)])};
    
        :hover {
            background: ${props => ((props.disabled || hoverOverDropdown) ? colors[(props.background as keyof typeof colors)] : colors[(props.background + 'Light') as keyof typeof colors])};
        }
    `;

    const InstallButton = styled(props =>
        <InstallButtonTemplate
            background= {'green'}
            name = 'Install'
            {...props}
        />)``;

    const UpdateButton = styled(
        props =>
            <InstallButtonTemplate
                background= {'orange'}
                name = 'Update'
                options = {[uninstall]}
                {...props}
            />)``;

    const SwitchButton = styled(
        props =>
            <InstallButtonTemplate
                background= {'pink'}
                name = 'Switch version'
                options = {[uninstall]}
                {...props}
            />)``;

    const CancelButton = styled(
        props =>
            <InstallButtonTemplate
                icon={null}
                background= {'red'}
                name = 'Cancel'
                {...props}
            />)``;

    const InstalledButton = styled(
        props =>
            <InstallButtonTemplate
                icon={null}
                style={{
                    color: '#dddddd',
                    pointerEvents: 'none'
                }}
                background= {'mutedGreen'}
                name = {props.inGitRepo ? 'Installed (git)' : 'Installed'}
                options = {[uninstall, bugReport, featureRequest]}
                disabled = {true}
                {...props}
            />)``;

    const DisabledButton = styled(
        (props: { text: string }) =>
            <InstallButtonTemplate
                icon={null}
                style={{
                    color: '#dddddd',
                    pointerEvents: 'none'
                }}
                background= {'disabled'}
                disabled = {true}
                name = {props.text}
                {...props}
            />)``;

    const [installButtonExtended, setInstallButtonExtended] = useState<boolean>(false);
    const [hoverOverDropdown, setHoverOverDropdown] = useState<boolean>(false);
    const [hoverOverButton, setHoverOverButton] = useState<boolean>(false);
    const toggleExtended = () => setInstallButtonExtended(!installButtonExtended);
    switch (installStatus) {
        case InstallStatus.UpToDate:
            return (
                <ButtonContainer>
                    <InstalledButton inGitRepo={false} />
                </ButtonContainer>
            );
        case InstallStatus.NeedsUpdate:
            return (
                <ButtonContainer>
                    <StateText>{'New release available'}</StateText>
                    <UpdateButton onClickAction={handleInstall} />
                </ButtonContainer>
            );
        case InstallStatus.FreshInstall:
            return <InstallButton onClick={handleInstall} />;
        case InstallStatus.GitInstall:
            return (
                <ButtonContainer>
                    <InstalledButton inGitRepo={true} />
                </ButtonContainer>
            );
        case InstallStatus.TrackSwitch:
            return (
                <ButtonContainer>
                    <SwitchButton onClickAction={handleInstall} />
                </ButtonContainer>
            );
        case InstallStatus.DownloadPrep:
            return (
                <ButtonContainer>
                    <StateText>Preparing update</StateText>
                    <DisabledButton text='Cancel'/>
                </ButtonContainer>
            );
        case InstallStatus.Downloading:
            return (
                <ButtonContainer>
                    <StateText>{`Downloading ${download?.module.toLowerCase()} module: ${download?.progress}%`}</StateText>
                    <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                </ButtonContainer>
            );
        case InstallStatus.Decompressing:
            return (
                <ButtonContainer>
                    <StateText>Decompressing</StateText>
                    <DisabledButton text='Cancel'/>
                </ButtonContainer>
            );
        case InstallStatus.DownloadEnding:
            return (
                <ButtonContainer>
                    <StateText>Finishing update</StateText>
                    <DisabledButton text='Cancel'/>
                </ButtonContainer>
            );
        case InstallStatus.DownloadDone:
            return (
                <ButtonContainer>
                    <StateText>Completed!</StateText>
                    <InstalledButton inGitRepo={false} onClickAction={handleInstall} />
                </ButtonContainer>
            );
        case InstallStatus.DownloadRetry:
            return (
                <ButtonContainer>
                    <StateText>Retrying {download?.module.toLowerCase()} module</StateText>
                    <DisabledButton text='Error'/>
                </ButtonContainer>
            );
        case InstallStatus.DownloadError:
            return (
                <ButtonContainer>
                    <StateText>Failed to install</StateText>
                    <DisabledButton text='Error'/>
                </ButtonContainer>
            );
        case InstallStatus.DownloadCanceled:
            return (
                <ButtonContainer>
                    <StateText>Download canceled</StateText>
                    <DisabledButton text='Error'/>
                </ButtonContainer>
            );
        case InstallStatus.Unknown:
            return (
                <ButtonContainer>
                    <StateText>Unknown state</StateText>
                    <DisabledButton text='Error'/>
                </ButtonContainer>
            );
        case InstallStatus.Wait:
            return (
                <ButtonContainer>
                    <DisabledButton text='Waiting'/>
                </ButtonContainer>
            );
    }
};
