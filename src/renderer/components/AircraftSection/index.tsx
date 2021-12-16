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
    VersionHistoryContainer
} from './styles';
import fs from "fs-extra";
import * as path from 'path';
import { getAddonReleases } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, AddonAndTrackLatestVersionNamesState, } from 'renderer/redux/types';
import { connect, useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import _ from 'lodash';
import { Version, Versions } from "renderer/components/AircraftSection/VersionHistory";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";
import { FragmenterInstaller, needsUpdate, getCurrentInstall } from "@flybywiresim/fragmenter";
import store, { InstallerStore, } from '../../redux/store';
import * as actionTypes from '../../redux/actionTypes';
import { Addon, AddonTrack, AddonVersion, Publisher } from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { Msfs } from "renderer/utils/Msfs";
import { LiveryConversionDialog } from "renderer/components/AircraftSection/LiveryConversion";
import { LiveryDefinition } from "renderer/utils/LiveryConversion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import settings, { useSetting } from "common/settings";
import { ipcRenderer } from 'electron';
import { colors } from 'renderer/style/theme';

// Props coming from renderer/components/App
type TransferredProps = {
    addon: Addon,
    publisher: Publisher
}

// Props coming from Redux' connect function
type ConnectedAircraftSectionProps = {
    selectedTracks: Record<string, AddonTrack>,
    installedTracks: Record<string, AddonTrack>,
    installStatus: Record<string, InstallStatus>,
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
    Hidden
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
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(props.addon.tracks[0]);
                return props.addon.tracks[0];
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
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(track);
                return track;
            }
        } catch (e) {
            console.error(e);
            console.log('Not installed');
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(props.addon.tracks[0]);
                return props.addon.tracks[0];
            }
        }
    };

    const installedTrack = (): AddonTrack => {
        try {
            return props.installedTracks[props.addon.key] as AddonTrack;
        } catch (e) {
            setInstalledTrack(null);
            return null;
        }
    };
    const setInstalledTrack = (newInstalledTrack: AddonTrack) => {
        store.dispatch({ type: actionTypes.SET_INSTALLED_TRACK, addonKey: props.addon.key, payload: newInstalledTrack });
    };

    const selectedTrack = (): AddonTrack => {
        try {
            return props.selectedTracks[props.addon.key] as AddonTrack;
        } catch (e) {
            setSelectedTrack(null);
            return null;
        }
    };

    const setSelectedTrack = (newSelectedTrack: AddonTrack) => {
        store.dispatch({ type: actionTypes.SET_SELECTED_TRACK, addonKey: props.addon.key, payload: newSelectedTrack });
    };

    const installStatus = (): InstallStatus => {
        try {
            return props.installStatus[props.addon.key] as InstallStatus;
        } catch (e) {
            setInstallStatus(InstallStatus.Unknown);
            return InstallStatus.Unknown;
        }
    };

    const setInstallStatus = (new_state: InstallStatus) => {
        store.dispatch({ type: actionTypes.SET_INSTALL_STATUS, addonKey: props.addon.key, payload: new_state });
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

    const download: DownloadItem = useSelector((state: InstallerStore) => _.find(state.downloads, { id: props.addon.name }));
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
        if (!isDownloading && installStatus() !== InstallStatus.DownloadPrep) {
            getInstallStatus().then(setInstallStatus);
        }
    }, [selectedTrack(), installedTrack()]);

    useEffect(() => {
        if (download && isDownloading) {
            ipcRenderer.send('set-window-progress-bar', download.progress / 100);
        } else {
            ipcRenderer.send('set-window-progress-bar', -1);
        }
    }, [download]);

    const [addonDiscovered, setAddonDiscovered] = useSetting<boolean>('cache.main.discoveredAddons.' + props.addon.key);

    const getInstallStatus = async (): Promise<InstallStatus> => {

        if (props.addon.hidden && !addonDiscovered) {
            return InstallStatus.Hidden;
        }
        if (!selectedTrack()) {
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
            const updateInfo = await needsUpdate(selectedTrack().url, installDir, {
                forceCacheBust: true
            });
            console.log('Update info', updateInfo);

            if (selectedTrack() !== installedTrack() && installedTrack()) {
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
        if (!isDownloading && installStatus() !== InstallStatus.DownloadPrep) {
            dispatch(callWarningModal(track.isExperimental, track, !track.isExperimental, () => selectAndSetTrack(track.key)));
        } else {
            selectAndSetTrack(selectedTrack().key);
        }
    };

    const handleInstall = () => {
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadAddon(selectedTrack()).then(() => console.log('Download and install complete'));
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
        switch (installStatus()) {
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

    const discoverPage = (): JSX.Element => {
        const [percentage, setPercentage] = useState<number>(0);
        const [animate, setAnimate] = useState<boolean>(false);
        const necessaryClicks = 5;
        const radius = 120;
        const circumface = 2 * Math.PI * radius;
        const draw = (100 - percentage) / 100 * circumface;
        const animation = () => {
            if (animate) {
                return { animation: 'spin 0.5s 1' };
            }
            return {};
        };

        const click = () => {
            if (!animate) {
                setPercentage(percentage + (100 / necessaryClicks));
                setAnimate(true);
                setTimeout(() =>{
                    setAnimate(false);
                }, 500);
                if (percentage === (100 - 100 / necessaryClicks)) {
                    setAnimate(true);
                    setTimeout(() =>{
                        setAddonDiscovered(true);
                    }, 250);
                }
            }
        };

        return (
            <div className={`bg-navy text-white flex h-full justify-center items-center ${(!wait && (props.addon.hidden && !addonDiscovered)) ? 'visible' : 'hidden'} ${props.addon.name}`}>
                <div className='h-1/2 w-1/2 justify-center items-center relative'>
                    <div className='absolute flex justify-center items-center h-full w-full'>
                        <svg style={{ transform: 'rotate(-90deg)' }} className="relative h-full w-full">
                            <circle cx="50%" cy="50%" r={radius} style={{ transition: 'all 0.2s ease-in-out', strokeWidth: 10, strokeLinecap: 'round', strokeDasharray: circumface, strokeDashoffset: draw, fill: 'none', stroke: (props.publisher.mainColor ?? colors.tealLight) }}/>
                        </svg>
                    </div>
                    <div className='absolute w-full h-full flex justify-center items-center'>
                        <img className="w-40 h-40 cursor-pointer" style={animation()} onClick={click} src={props.publisher.logoUrl} alt="Logo" id="logo"/>
                    </div>
                </div>
            </div>
        );
    };

    const liveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries.map((entry) => entry.livery);
    });

    return (
        <>
            <div className={`bg-navy ${(wait || (props.addon.hidden && !addonDiscovered)) ? 'hidden' : 'visible'} ${props.addon.name}`}>
                <HeaderImage addonKey={props.addon.key}>
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
                                            isSelected={selectedTrack() === track}
                                            isInstalled={installedTrack()?.key === track.key}
                                            handleSelected={() => handleTrackSelection(track)}
                                        />
                                    )
                                }
                            </Tracks>
                        </div>
                        <div>
                            {props.addon.tracks.filter((track) => track.isExperimental).length > 0 && <h5 className="text-base text-teal-50 uppercase">Experimental versions</h5>}
                            <Tracks>
                                {
                                    props.addon.tracks.filter((track) => track.isExperimental).map(track =>
                                        <Track
                                            addon={props.addon}
                                            key={track.key}
                                            track={track}
                                            isSelected={selectedTrack() === track}
                                            isInstalled={installedTrack()?.key === track.key}
                                            handleSelected={() => handleTrackSelection(track)}
                                        />
                                    )
                                }
                            </Tracks>
                        </div>
                    </TopContainer>
                    <LeftContainer className={'col-start-1 ' + (props.addon.gitHubReleaseBaseURL ? 'col-end-2' : 'col-end-3')}>
                        <DetailsContainer>
                            {selectedTrack().description && <h3 className="font-semibold text-teal-50">About This Version</h3>}
                            <ReactMarkdown
                                className="text-lg text-gray-300"
                                children={selectedTrack()?.description ?? ''}
                                remarkPlugins={[remarkGfm]}
                                linkTarget={"_blank"}
                            />
                            <h3 className="font-semibold text-teal-50">Details</h3>
                            <ReactMarkdown
                                className="text-lg text-gray-300"
                                children={props.addon.description ?? ''}
                                remarkPlugins={[remarkGfm]}
                                linkTarget={"_blank"}
                            />
                        </DetailsContainer>
                    </LeftContainer>
                    {props.addon.gitHubReleaseBaseURL && <VersionHistoryContainer>
                        <h3 className="font-semibold text-teal-50">Release History</h3>
                        <Versions>
                            {
                                releases.map((version, idx) =>
                                    <Version key={idx} index={idx} version={version} baseURL={props.addon.gitHubReleaseBaseURL} />
                                )
                            }
                        </Versions>
                    </VersionHistoryContainer>}
                </Content>
            </div>
            {discoverPage()}
        </>
    );
};

const mapStateToProps = (state: ConnectedAircraftSectionProps) => {
    return {
        ...state
    };
};

export default connect(mapStateToProps) (index);
