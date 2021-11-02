import React, { useEffect, useState } from 'react';
import {
    ButtonContainer,
    ButtonsContainer as SelectionContainer,
    CancelButton,
    Content,
    DetailsContainer,
    DisabledButton,
    DownloadProgress,
    HeaderImage,
    InstallButton,
    InstalledButton,
    LeftContainer,
    DialogContainer,
    ModelInformationContainer,
    ModelName,
    ModelSmallDesc,
    StateText,
    SwitchButton,
    TopContainer,
    UpdateButton,
    VersionHistoryContainer,
    StartMSFSButton,
    CloseMSFSButton
} from './styles';
import Store from 'electron-store';
import fs from "fs-extra";
import * as path from 'path';
import { getAddonReleases } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, AddonAndTrackLatestVersionNamesState, RootStore } from 'renderer/redux/types';
import { connect, useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import _ from 'lodash';
import { Version, Versions } from "renderer/components/AircraftSection/VersionHistory";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";
import { FragmenterInstaller, needsUpdate, getCurrentInstall } from "@flybywiresim/fragmenter";
import store, { InstallerStore } from '../../redux/store';
import * as actionTypes from '../../redux/actionTypes';
import { Addon, AddonTrack, AddonVersion } from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { Msfs } from "renderer/utils/Msfs";
import { LiveryConversionDialog } from "renderer/components/AircraftSection/LiveryConversion";
import { LiveryDefinition } from "renderer/utils/LiveryConversion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const settings = new Store;

// Props coming from renderer/components/App
type TransferredProps = {
    addon: Addon,
}

// Props coming from Redux' connect function
type ConnectedAircraftSectionProps = {
    selectedTrack: AddonTrack,
    installedTrack: AddonTrack,
    installStatus: InstallStatus,
    latestVersionNames: AddonAndTrackLatestVersionNamesState
}

type AircraftSectionProps = TransferredProps & ConnectedAircraftSectionProps

let abortController: AbortController;

export enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    FreshInstall,
    GitInstall,
    TrackSwitch,
    DownloadPrep,
    Downloading,
    Decompressing,
    DownloadEnding,
    DownloadDone,
    DownloadRetry,
    DownloadError,
    DownloadCanceled,
    Unknown,
}

enum MsfsStatus {
    Open,
    Closed,
    Checking,
}

const index: React.FC<TransferredProps> = (props: AircraftSectionProps) => {
    const findInstalledTrack = (): AddonTrack => {
        if (!Directories.isFragmenterInstall(props.addon)) {
            console.log('Not installed');
            if (selectedTrack === null) {
                setSelectedTrack(props.addon.tracks[0]);
                return props.addon.tracks[0];
            } else {
                selectAndSetTrack(props.selectedTrack.key);
                return selectedTrack;
            }
        }

        try {
            const manifest = getCurrentInstall(Directories.inCommunity(props.addon.targetDirectory));
            console.log('Currently installed', manifest);

            let track = _.find(props.addon.tracks, { url: manifest.source });
            if (!track) {
                track = _.find(props.addon.tracks, { alternativeUrls: [manifest.source] });
            }
            console.log('Currently installed', track);
            setInstalledTrack(track);
            if (selectedTrack === null) {
                setSelectedTrack(track);
                return track;
            } else {
                selectAndSetTrack(props.selectedTrack.key);
                return selectedTrack;
            }
        } catch (e) {
            console.error(e);
            console.log('Not installed');
            if (selectedTrack === null) {
                setSelectedTrack(props.addon.tracks[0]);
                return props.addon.tracks[0];
            } else {
                selectAndSetTrack(props.selectedTrack.key);
                return selectedTrack;
            }
        }
    };

    const installedTrack = props.installedTrack;
    const setInstalledTrack = (newInstalledTrack: AddonTrack) => {
        store.dispatch({ type: actionTypes.SET_INSTALLED_TRACK, payload: newInstalledTrack });
    };

    const selectedTrack = props.selectedTrack;
    const setSelectedTrack = (newSelectedTrack: AddonTrack) => {
        store.dispatch({ type: actionTypes.SET_SELECTED_TRACK, payload: newSelectedTrack });
    };

    const installStatus = props.installStatus;
    const setInstallStatus = (new_state: InstallStatus) => {
        store.dispatch({ type: actionTypes.SET_INSTALL_STATUS, payload: new_state });
    };

    const [msfsIsOpen, setMsfsIsOpen] = useState<MsfsStatus>(MsfsStatus.Checking);

    const [wait, setWait] = useState(1);

    const [releases, setReleases] = useState<AddonVersion[]>([]);

    useEffect(() => {
        getAddonReleases(props.addon).then(releases => {
            setReleases(releases);
            setWait(wait => wait - 1);
            findInstalledTrack();
        });
    }, [props.addon]);

    const download: DownloadItem = useSelector((state: RootStore) => _.find(state.downloads, { id: props.addon.name }));
    const dispatch = useDispatch();

    const isDownloading = download?.progress >= 0;

    useEffect(() => {
        const checkMsfsInterval = setInterval(async () => {
            setMsfsIsOpen(await Msfs.isRunning() ? MsfsStatus.Open : MsfsStatus.Closed);
        }, 500);

        return () => clearInterval(checkMsfsInterval);
    }, []);

    useEffect(() => {
        findInstalledTrack();
        if (!isDownloading && installStatus !== InstallStatus.DownloadPrep) {
            getInstallStatus().then(setInstallStatus);
        }
    }, [selectedTrack, installedTrack]);

    const getInstallStatus = async (): Promise<InstallStatus> => {
        if (!selectedTrack) {
            return InstallStatus.Unknown;
        }

        console.log('Checking install status');

        const installDir = Directories.inCommunity(props.addon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            return InstallStatus.FreshInstall;
        }

        console.log('Checking for git install');
        if (Directories.isGitInstall(installDir)) {
            return InstallStatus.GitInstall;
        }

        try {
            const updateInfo = await needsUpdate(selectedTrack.url, installDir, {
                forceCacheBust: true
            });
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

    const downloadAddon = async (track: AddonTrack) => {
        const installDir = Directories.inCommunity(props.addon.targetDirectory);
        const tempDir = Directories.temp();

        console.log('Installing', track);
        console.log('Installing into', installDir, 'using temp dir', tempDir);

        // Prepare temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
        }
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        console.log('Checking for existing install');
        if (Directories.isFragmenterInstall(installDir)) {
            setInstallStatus(InstallStatus.DownloadPrep);
            console.log('Found existing install at', installDir);
            console.log('Copying existing install to', tempDir);
            await fs.copy(installDir, tempDir);
            console.log('Finished copying');
        }

        // Initialize abort controller for downloads
        abortController = new AbortController();
        const signal = abortController.signal;

        try {
            let lastPercent = 0;
            setInstallStatus(InstallStatus.Downloading);
            dispatch(registerDownload(props.addon.name, ''));

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on('downloadStarted', module => {
                console.log('Downloading started for module', module.name);
                setInstallStatus(InstallStatus.Downloading);
            });
            installer.on('downloadProgress', (module, progress) => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    dispatch(updateDownloadProgress(props.addon.name, module.name, progress.percent));
                }
            });
            installer.on('unzipStarted', module => {
                console.log('Started unzipping module', module.name);
                setInstallStatus(InstallStatus.Decompressing);
            });
            installer.on('retryScheduled', (module, retryCount, waitSeconds) => {
                console.log('Scheduling a retry for module', module.name);
                console.log('Retry count', retryCount);
                console.log('Waiting for', waitSeconds, 'seconds');

                setInstallStatus(InstallStatus.DownloadRetry);
            });
            installer.on('retryStarted', (module, retryCount) => {
                console.log('Starting a retry for module', module.name);
                console.log('Retry count', retryCount);

                setInstallStatus(InstallStatus.Downloading);
            });

            console.log('Starting fragmenter download for URL', track.url);
            const installResult = await installer.install(signal, {
                forceCacheBust: !(settings.get('mainSettings.useCdnCache') as boolean),
                forceFreshInstall: false,
                forceManifestCacheBust: true,
            });
            console.log('Fragmenter download finished for URL', track.url);

            // Copy files from temp dir
            setInstallStatus(InstallStatus.DownloadEnding);
            Directories.removeTargetForAddon(props.addon);
            console.log('Copying files from', tempDir, 'to', installDir);
            await fs.copy(tempDir, installDir, { recursive: true });
            console.log('Finished copying files from', tempDir, 'to', installDir);

            // Remove installs existing under alternative names
            console.log('Removing installs existing under alternative names');
            Directories.removeAlternativesForAddon(props.addon);
            console.log('Finished removing installs existing under alternative names');

            dispatch(deleteDownload(props.addon.name));
            notifyDownload(true);

            // Flash completion text
            setInstalledTrack(track);
            setInstallStatus(InstallStatus.DownloadDone);

            console.log('Finished download', installResult);
        } catch (e) {
            if (signal.aborted) {
                setInstallStatus(InstallStatus.DownloadCanceled);
            } else {
                console.error(e);
                setInstallStatus(InstallStatus.DownloadError);
                notifyDownload(false);
            }
            setTimeout(async () => setInstallStatus(await getInstallStatus()), 3_000);
        }

        dispatch(deleteDownload(props.addon.name));

        // Clean up temp dir
        Directories.removeAllTemp();
    };

    const selectAndSetTrack = async (key: string) => {
        const newTrack = props.addon.tracks.find(x => x.key === key);
        setSelectedTrack(newTrack);
    };

    const handleTrackSelection = (track: AddonTrack) => {
        if (!isDownloading && installStatus !== InstallStatus.DownloadPrep) {
            dispatch(callWarningModal(track.isExperimental, track, !track.isExperimental, () => selectAndSetTrack(track.key)));
        } else {
            selectAndSetTrack(props.selectedTrack.key);
        }
    };

    const handleInstall = () => {
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadAddon(selectedTrack).then(() => console.log('Download and install complete'));
        } else {
            setupInstallPath().then();
        }
    };

    const handleCancel = () => {
        if (isDownloading) {
            console.log('Cancel download');
            abortController.abort();
            dispatch(deleteDownload(props.addon.name));
        }
    };

    const notifyDownload = (successful: boolean) => {
        console.log('Requesting notification');
        Notification.requestPermission().then(function () {
            console.log('Showing notification');
            if (successful) {
                new Notification('Download complete!', {
                    'icon': path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
                    'body': "You're ready to fly",
                });
            } else {
                new Notification('Download failed!', {
                    'icon': path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
                    'body': "Oops, something went wrong",
                });
            }
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
                        <InstalledButton inGitRepo={false} />
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
        }
    };

    const liveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries.map((entry) => entry.livery);
    });

    function startMSFS() {
        const child = require('child_process').execFile;
        const file = "FlightSimulator.exe";

        child(file, function (err: unknown,) {
            if (err) {
                console.error(err);
            }
            return (
                <StartMSFSButton>
                    <button onClick={startMSFS} className="button">Start MSFS</button>
                </StartMSFSButton>
            );

        });
    }

    function closeMSFS() {
        const MsfsStatus = require('process');
        MsfsStatus.kill(0);

        return (
            <CloseMSFSButton>
                <button onClick={closeMSFS} className="button">Close MSFS</button>
            </CloseMSFSButton>
        );

    }

    return (
        <div className={`bg-navy ${wait ? 'hidden' : 'visible'}`}>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.addon.name}</ModelName>
                    <ModelSmallDesc>{props.addon.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {msfsIsOpen !== MsfsStatus.Closed && <>
                        <ButtonContainer>
                            <StateText>{msfsIsOpen === MsfsStatus.Open ? "Please close MSFS" : "Checking status..."}</StateText>
                            <DisabledButton text='Update' />
                        </ButtonContainer>
                    </>}
                    {msfsIsOpen === MsfsStatus.Closed && getInstallButton()}
                    <ButtonContainer>
                        <StartMSFSButton>
                            <button onClick={startMSFS} className="button">Start MSFS</button>
                        </StartMSFSButton>
                        <CloseMSFSButton>
                            <button onClick={closeMSFS} className="button">Close MSFS</button>
                        </CloseMSFSButton>
                    </ButtonContainer>
                </SelectionContainer>
            </HeaderImage>
            <DownloadProgress percent={download?.progress} strokeColor="#00c2cc" trailColor="transparent" showInfo={false} status="active" />
            <Content>
                {liveries.length > 0 &&
                    <DialogContainer>
                        <LiveryConversionDialog />
                    </DialogContainer>
                }
                <TopContainer className={liveries.length > 0 ? 'mt-0' : '-mt-5'}>
                    <div>
                        <h5 className="text-base text-teal-50 uppercase">Mainline versions</h5>
                        <Tracks>
                            {
                                props.addon.tracks.filter((track) => !track.isExperimental).map(track =>
                                    <Track
                                        addon={props.addon}
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack === track}
                                        isInstalled={installedTrack?.key === track.key}
                                        handleSelected={() => handleTrackSelection(track)}
                                    />
                                )
                            }
                        </Tracks>
                    </div>
                    <div>
                        <h5 className="text-base text-teal-50 uppercase">Experimental versions</h5>
                        <Tracks>
                            {
                                props.addon.tracks.filter((track) => track.isExperimental).map(track =>
                                    <Track
                                        addon={props.addon}
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack === track}
                                        isInstalled={installedTrack?.key === track.key}
                                        handleSelected={() => handleTrackSelection(track)}
                                    />
                                )
                            }
                        </Tracks>
                    </div>
                </TopContainer>
                <LeftContainer>
                    <DetailsContainer>
                        <h3 className="font-semibold text-teal-50">About This Version</h3>
                        <ReactMarkdown
                            className="text-lg text-gray-300"
                            children={selectedTrack?.description ?? ''}
                            remarkPlugins={[remarkGfm]}
                            linkTarget={"_blank"}
                        />
                        <h3 className="font-semibold text-teal-50">Details</h3>
                        <p className="text-lg text-gray-300">{props.addon.description}</p>
                    </DetailsContainer>
                </LeftContainer>
                <VersionHistoryContainer>
                    <h3 className="font-semibold text-teal-50">Release History</h3>
                    <Versions>
                        {
                            releases.map((version, idx) =>
                                <Version key={idx} index={idx} version={version} />
                            )
                        }
                    </Versions>
                </VersionHistoryContainer>
            </Content>
        </div>
    );
};

const mapStateToProps = (state: ConnectedAircraftSectionProps) => {
    return {
        ...state
    };
};

export default connect(mapStateToProps) (index);
