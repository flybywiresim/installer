import React, { FC, useEffect, useState } from 'react';
import { DialogContainer, } from './styles';
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
import settings from "common/settings";
import { ipcRenderer } from 'electron';
import { NavLink, Redirect, Route } from 'react-router-dom';
import { InfoCircle, JournalText, Palette, Sliders } from 'react-bootstrap-icons';
import './index.css';

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

interface InstallButtonProps {
    className?: string;
    onClick?: () => void;
}

const InstallButton: FC<InstallButtonProps> = ({ children, className, onClick }) => (
    <div className={`w-64 text-white font-bold text-2xl rounded-md p-4 flex-shrink-0 flex flex-row items-center justify-center cursor-pointer transition duration-200 ${className}`} onClick={onClick}>
        {children}
    </div>
);

const StateText: FC = ({ children }) => (
    <div className="text-white text-2xl font-bold">
        {children}
    </div>
);

interface SideBarLinkProps {
    to: string;
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children }) => (
    <NavLink
        className="flex flex-row items-center gap-x-5 justify-center text-2xl text-white hover:text-cyan"
        activeClassName="text-cyan"
        to={to}
    >
        {children}
    </NavLink>
);

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

    const [releases, setReleases] = useState<AddonVersion[]>([]);

    useEffect(() => {
        getAddonReleases(props.addon).then(releases => {
            setReleases(releases);
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

    useEffect(() => {
        if (download && isDownloading) {
            ipcRenderer.send('set-window-progress-bar', download.progress / 100);
        } else {
            ipcRenderer.send('set-window-progress-bar', -1);
        }
    }, [download]);

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

    const activeState = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <StateText>
                    {msfsIsOpen === MsfsStatus.Open ? "Please close MSFS" : "Checking status..."}
                </StateText>
            );
        }

        switch (installStatus) {
            case InstallStatus.UpToDate:
                return (
                    <></>
                );
            case InstallStatus.NeedsUpdate:
                return (
                    <StateText>New release available</StateText>
                );
            case InstallStatus.FreshInstall:
                return (
                    <></>
                );
            case InstallStatus.GitInstall:
                return (
                    <></>
                );
            case InstallStatus.TrackSwitch:
                return (
                    <></>
                );
            case InstallStatus.DownloadPrep:
                return (
                    <StateText>Preparing update</StateText>
                );
            case InstallStatus.Downloading:
                return (
                    <StateText>{`Downloading ${download?.module.toLowerCase()} module`}</StateText>
                );
            case InstallStatus.Decompressing:
                return (
                    <StateText>Decompressing</StateText>
                );
            case InstallStatus.DownloadEnding:
                return (
                    <StateText>Finishing update</StateText>
                );
            case InstallStatus.DownloadDone:
                return (
                    <StateText>Completed!</StateText>
                );
            case InstallStatus.DownloadRetry:
                return (
                    <StateText>Retrying {download?.module.toLowerCase()} module</StateText>
                );
            case InstallStatus.DownloadError:
                return (
                    <StateText>Failed to install</StateText>
                );
            case InstallStatus.DownloadCanceled:
                return (
                    <StateText>Download canceled</StateText>
                );
            case InstallStatus.Unknown:
                return (
                    <StateText>Unknown state</StateText>
                );
        }
    };

    const activeInstallButton = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <InstallButton className="bg-gray-700 text-grey-medium pointer-events-none">
                    Update
                </InstallButton>
            );
        }

        switch (installStatus) {
            case InstallStatus.UpToDate:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed
                    </InstallButton>
                );
            case InstallStatus.NeedsUpdate:
                return (
                    <InstallButton className="bg-yellow-500 hover:bg-yellow-400" onClick={handleInstall}>
                        Update
                    </InstallButton>
                );
            case InstallStatus.FreshInstall:
                return (
                    <InstallButton className="pointer-events-none bg-green-500" onClick={handleInstall}>
                        Installed
                    </InstallButton>
                );
            case InstallStatus.GitInstall:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed (git)
                    </InstallButton>
                );
            case InstallStatus.TrackSwitch:
                return (
                    <InstallButton className="bg-purple-600 hover:bg-purple-700" onClick={handleInstall}>
                        Switch Version
                    </InstallButton>
                );
            case InstallStatus.DownloadPrep:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.Downloading:
                return (
                    <InstallButton className="bg-red-600 hover:bg-red-500" onClick={handleCancel}>
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.Decompressing:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.DownloadEnding:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.DownloadDone:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed
                    </InstallButton>
                );
            case InstallStatus.DownloadRetry:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.DownloadError:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.DownloadCanceled:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.Unknown:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
        }
    };

    const liveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries.map((entry) => entry.livery);
    });

    return (
        <div className="bg-navy-light flex flex-col h-full">
            <div className="h-full relative bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url(${props.addon.backgroundImageUrl})` }}
            >
                <div className="absolute bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full">
                    <div>
                        {activeState()}
                        {/* TODO: Actually calculate this value */}
                        {installStatus === InstallStatus.Downloading && (
                            <div className="text-white text-2xl">98.7 mb/s</div>
                        )}
                    </div>
                    {installStatus === InstallStatus.Downloading && (
                        // TODO: Replace this with a JIT value
                        <div className="text-white font-semibold" style={{ fontSize: '38px' }}>
                            {download?.progress}%
                        </div>
                    )}
                </div>
                {installStatus === InstallStatus.Downloading && (
                    <div className="absolute -bottom-1 w-full h-2 bg-cyan progress-bar-animated" style={{ width: `${download?.progress}%` }}/>
                )}
            </div>
            <div className="flex flex-row h-full relative">
                <div className="p-5 overflow-y-scroll w-full">
                    <Route path="/aircraft-section">
                        <Redirect to="/aircraft-section/configure" />
                    </Route>
                    <Route path="/aircraft-section/configure">
                        {liveries.length > 0 &&
                    <DialogContainer>
                        <LiveryConversionDialog />
                    </DialogContainer>
                        }
                        <div className="">
                            <h2 className="text-white font-extrabold">Choose Your Version</h2>
                            <div className="flex flex-row gap-x-8">
                                <div>
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
                                    <h5 className="text-base text-teal-50 mt-2">Mainline Releases</h5>
                                </div>
                                <div>
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
                                    <h5 className="text-base text-teal-50 mt-2">Experimental Releases</h5>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <h2 className="text-white font-extrabold">Description</h2>
                            <p className="text-xl text-white font-manrope">{props.addon.description}</p>
                        </div>
                    </Route>
                </div>
                <div className="flex flex-col items-center justify-between h-full relative bg-navy p-7 flex-shrink-0">
                    <div className="flex flex-col items-start place-self-start space-y-7">
                        <SideBarLink to="/aircraft-section/configure">
                            <Sliders size={24}/>
                            Configure
                        </SideBarLink>
                        <SideBarLink to="/aircraft-section/release-notes">
                            <JournalText size={24}/>
                            Release Notes
                        </SideBarLink>
                        <SideBarLink to="/aircraft-section/liveries">
                            <Palette size={24}/>
                            Liveries
                        </SideBarLink>
                        <SideBarLink to="/aircraft-section/about">
                            <InfoCircle size={24}/>
                            About
                        </SideBarLink>
                    </div>
                    <div>
                        {activeInstallButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: ConnectedAircraftSectionProps) => {
    return {
        ...state
    };
};

export default connect(mapStateToProps) (index);
