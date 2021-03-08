import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import {
    ButtonContainer,
    ButtonsContainer as SelectionContainer,
    CancelButton,
    Container,
    Content,
    DetailsContainer,
    DisabledButton,
    DownloadProgress,
    EngineOption,
    EngineOptionsContainer,
    HeaderImage,
    InstallButton,
    InstalledButton,
    LeftContainer,
    ModelInformationContainer,
    ModelName,
    ModelSmallDesc,
    StateText,
    SwitchButton,
    TopContainer,
    UpdateButton,
    VersionHistoryContainer
} from './styles';
import Store from 'electron-store';
import fs from "fs-extra";
import net from "net";
import { getModReleases, Mod, ModTrack, ModVariant, ModVersion } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, RootStore } from 'renderer/redux/types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import _ from 'lodash';
import { Version, Versions } from "renderer/components/AircraftSection/VersionHistory";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";
import { install, needsUpdate, getCurrentInstall } from "@flybywiresim/fragmenter";
import * as path from "path";

const settings = new Store;

const { Paragraph } = Typography;

type Props = {
    mod: Mod
}

let abortController: AbortController;

enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    FreshInstall,
    GitInstall,
    TrackSwitch,
    DownloadPrep,
    Downloading,
    DownloadDone,
    DownloadError,
    DownloadCanceled,
    Unknown,
}

enum MsfsStatus {
    Open,
    Closed,
    Checking,
}

const index: React.FC<Props> = (props: Props) => {
    const getInstallDir = (): string => {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, props.mod.targetDirectory);
    };

    const getTempDir = (): string => {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, `${props.mod.targetDirectory}-temp`);
    };

    const findInstalledTrack = (): ModTrack => {
        try {
            const manifest = getCurrentInstall(getInstallDir());
            console.log('Currently installed', manifest);

            const track = _.find(props.mod.variants[0].tracks, { url: manifest.source });
            console.log('Currently installed', track);

            setInstalledTrack(track);
            setSelectedTrack(track);

            return track;
        } catch (e) {
            console.error(e);
            console.log('Not installed');

            setSelectedTrack(props.mod.variants[0]?.tracks[0]);
            return props.mod.variants[0]?.tracks[0];
        }
    };

    const [selectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>();
    const [installedTrack, setInstalledTrack] = useState<ModTrack>();

    const [installStatus, setInstallStatus] = useState<InstallStatus>(InstallStatus.Unknown);
    const [msfsIsOpen, setMsfsIsOpen] = useState<MsfsStatus>(MsfsStatus.Checking);

    const [wait, setWait] = useState(1);

    const [releases, setReleases] = useState<ModVersion[]>([]);

    useEffect(() => {
        getModReleases(props.mod).then(releases => {
            setReleases(releases);
            setWait(wait => wait - 1);
            findInstalledTrack();
        });
    }, [props.mod]);

    const download: DownloadItem = useSelector((state: RootStore) => _.find(state.downloads, { id: props.mod.name }));
    const dispatch = useDispatch();

    const isDownloading = download?.progress >= 0;

    useEffect(() => {
        const checkMsfsInterval = setInterval(checkIfMSFS, 500);

        return () => clearInterval(checkMsfsInterval);
    }, []);

    useEffect(() => {
        getInstallStatus().then(setInstallStatus);
    }, [selectedTrack]);

    const isGitInstall = (dir: string): boolean => {
        console.log('Checking for git install');
        try {
            const symlinkPath = fs.readlinkSync(dir);
            if (symlinkPath && fs.existsSync(path.join(symlinkPath, '/../.git'))) {
                console.log('Is git repo');
                return true;
            }
        } catch {
            console.log('Is not git repo');
            return false;
        }
    };

    const getInstallStatus = async (): Promise<InstallStatus> => {
        if (!selectedTrack) {
            return InstallStatus.Unknown;
        }

        console.log('Checking install status');

        const installDir = getInstallDir();
        if (!fs.existsSync(installDir)) {
            fs.mkdirSync(installDir);
        }

        if (isGitInstall(installDir)) {
            return InstallStatus.GitInstall;
        }

        try {
            const updateInfo = await needsUpdate(selectedTrack.url, installDir);
            console.log('Update info', updateInfo);

            if (selectedTrack !== installedTrack && installedTrack !== null) {
                return InstallStatus.TrackSwitch;
            }
            if (updateInfo.isFreshInstall) {
                return InstallStatus.FreshInstall;
            }

            if (updateInfo.needsUpdate) {
                return InstallStatus.NeedsUpdate;
            }

            return InstallStatus.UpToDate;
        } catch (e) {
            console.error(e);
            return InstallStatus.Unknown;
        }
    };

    const checkIfMSFS = () => {
        const socket = net.connect(500);

        socket.on('connect', () => {
            setMsfsIsOpen(MsfsStatus.Open);
            socket.destroy();
        });
        socket.on('error', () => {
            setMsfsIsOpen(MsfsStatus.Closed);
            socket.destroy();
        });
    };

    const downloadMod = async (track: ModTrack) => {
        const installDir = getInstallDir();
        const tempDir = getTempDir();
        console.log('Installing into', installDir, 'using temp dir', tempDir);

        // Prepare temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
        }
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        setInstallStatus(InstallStatus.DownloadPrep);
        await fs.copy(installDir, tempDir);

        // Initialize abort controller for downloads
        abortController = new AbortController();
        const signal = abortController.signal;

        try {
            let lastPercent = 0;
            setInstallStatus(InstallStatus.Downloading);
            dispatch(registerDownload(props.mod.name, ''));

            // Perform the fragmenter download
            const installResult = await install(track.url, tempDir, false, progress => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    dispatch(updateDownloadProgress(props.mod.name, progress.module, progress.percent));
                }
            }, signal);

            // Copy files from temp dir
            console.log('Copying files from temp directory to install directory');
            fs.rmdirSync(installDir, { recursive: true });
            await fs.copy(tempDir, installDir);

            dispatch(deleteDownload(props.mod.name));
            notifyDownload();

            // Flash completion text
            setInstallStatus(InstallStatus.DownloadDone);
            setTimeout(async () => setInstallStatus(await getInstallStatus()), 3_000);

            setInstalledTrack(track);
            console.log(installResult);
        } catch (e) {
            if (signal.aborted) {
                setInstallStatus(InstallStatus.DownloadCanceled);
                setTimeout(async () => setInstallStatus(await getInstallStatus()), 3_000);
                return;
            }

            console.error(e);

            // Flash error text
            setInstallStatus(InstallStatus.DownloadError);
            setTimeout(async () => setInstallStatus(await getInstallStatus()), 3_000);

            dispatch(deleteDownload(props.mod.name));
        } finally {
            // Clean up temp dir
            fs.rmdirSync(tempDir, { recursive: true });
        }
    };

    const selectAndSetTrack = async (key: string) => {
        if (!isDownloading && installStatus !== InstallStatus.DownloadPrep) {
            const newTrack = selectedVariant.tracks.find(x => x.key === key);
            setSelectedTrack(newTrack);
        }
    };

    const handleTrackSelection = (track: ModTrack) => {
        if (!isDownloading && installStatus !== InstallStatus.DownloadPrep) {
            dispatch(callWarningModal(track.isExperimental, track, !track.isExperimental, () => selectAndSetTrack(track.key)));
        }
    };

    const handleInstall = () => {
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadMod(selectedTrack).then(() => console.log('Download and install complete'));
        } else {
            setupInstallPath().then();
        }
    };

    const handleCancel = () => {
        if (isDownloading) {
            console.log('Cancel download');
            abortController.abort();
            dispatch(deleteDownload(props.mod.name));
        }
    };

    const notifyDownload = () => {
        console.log('Requesting notification');
        Notification.requestPermission().then(function () {
            console.log('Showing notification');
            new Notification('Download complete!', {
                'body': "You're ready to fly",
            });
        }).catch(e => console.log(e));
    };

    const getInstallButton = (): JSX.Element => {
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
                        <UpdateButton onClick={handleInstall} />
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
                return <SwitchButton onClick={handleInstall} />;
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
                        <StateText>{download?.progress >= 99 ? 'Decompressing' : `Downloading ${download?.module.toLowerCase()} module: ${download?.progress}%`}</StateText>
                        <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                    </ButtonContainer>
                );
            case InstallStatus.DownloadDone:
                return (
                    <ButtonContainer>
                        <StateText>Completed!</StateText>
                        <InstalledButton inGitRepo={false} />
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
        }
    };

    return (
        <Container wait={wait}>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.mod.name}</ModelName>
                    <ModelSmallDesc>{props.mod.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {msfsIsOpen !== MsfsStatus.Closed && <>
                        <ButtonContainer>
                            <StateText>{msfsIsOpen === MsfsStatus.Open ? "Please close MSFS" : "Checking status..."}</StateText>
                            <DisabledButton text='Update' />
                        </ButtonContainer>
                    </>}
                    {msfsIsOpen === MsfsStatus.Closed && getInstallButton()}
                </SelectionContainer>
            </HeaderImage>
            <DownloadProgress percent={download?.progress} showInfo={false} status="active" />
            <Content>
                <TopContainer>
                    <div>
                        <h5>Mainline versions</h5>
                        <Tracks>
                            {
                                selectedVariant.tracks.filter(track => !track.isExperimental).map(track =>
                                    <Track
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack === track}
                                        isInstalled={installedTrack === track}
                                        onSelected={() => handleTrackSelection(track)}
                                    />
                                )
                            }
                        </Tracks>
                    </div>
                    <div>
                        <h5>Experimental versions</h5>
                        <Tracks>
                            {
                                selectedVariant.tracks.filter(track => track.isExperimental).map(track =>
                                    <Track
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack === track}
                                        isInstalled={installedTrack === track}
                                        onSelected={() => handleTrackSelection(track)}
                                    />
                                )
                            }
                        </Tracks>
                    </div>
                </TopContainer>
                <LeftContainer>
                    <DetailsContainer>
                        <h3>Details</h3>
                        <Paragraph style={{ color: '#858585', fontSize: '16px' }}>{props.mod.description}</Paragraph>
                    </DetailsContainer>
                    <EngineOptionsContainer>
                        <h3>Variants</h3>
                        {
                            props.mod.variants.map(variant =>
                                // TODO: Enable onClick when mod variants are available
                                <EngineOption key={variant.key} aria-disabled={!variant.enabled}>
                                    <img src={variant.imageUrl} alt={variant.imageAlt} />
                                    <span>{variant.name}</span>
                                </EngineOption>
                            )
                        }
                    </EngineOptionsContainer>
                </LeftContainer>
                <VersionHistoryContainer>
                    <h3>Version history</h3>
                    <Versions>
                        {
                            releases.map((version, idx) =>
                                <Version key={idx} index={idx} version={version} />
                            )
                        }
                    </Versions>
                </VersionHistoryContainer>
            </Content>
        </Container>
    );
};

export default index;
