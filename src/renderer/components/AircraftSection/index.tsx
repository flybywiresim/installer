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
import Store from 'electron-store';
import fs from "fs-extra";
import { getModReleases } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, ModAndTrackLatestVersionNamesState, RootStore } from 'renderer/redux/types';
import { connect, useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import _ from 'lodash';
import { Version, Versions } from "renderer/components/AircraftSection/VersionHistory";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";
import { needsUpdate, getCurrentInstall } from "@flybywiresim/fragmenter";
import store, { InstallerStore } from '../../redux/store';
import * as actionTypes from '../../redux/actionTypes';
import { Mod, ModTrack, ModVersion } from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { Msfs } from "renderer/utils/Msfs";
import { LiveryConversionDialog } from "renderer/components/AircraftSection/LiveryConversion";
import { LiveryDefinition } from "renderer/utils/LiveryConversion";
import { Fragmenter } from "renderer/installMethods/Fragmenter";

const settings = new Store;

// Props coming from renderer/components/App
type TransferredProps = {
    mod: Mod,
}

// Props coming from Redux' connect function
type ConnectedAircraftSectionProps = {
    selectedTrack: ModTrack,
    installedTrack: ModTrack,
    installStatus: InstallStatus,
    latestVersionNames: ModAndTrackLatestVersionNamesState
}

type AircraftSectionProps = TransferredProps & ConnectedAircraftSectionProps

let abortController: AbortController;

export enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    FreshInstall,
    GitInstall,
    TrackSwitch,
    Downloading,
    Unknown,
}

enum MsfsStatus {
    Open,
    Closed,
    Checking,
}

const index: React.FC<TransferredProps> = (props: AircraftSectionProps) => {
    const findInstalledTrack = (): ModTrack => {
        if (!Directories.isFragmenterInstall(props.mod)) {
            console.log('Not installed');
            if (selectedTrack === null) {
                setSelectedTrack(props.mod.tracks[0]);
                return props.mod.tracks[0];
            } else {
                selectAndSetTrack(props.selectedTrack.key);
                return selectedTrack;
            }
        }

        try {
            const manifest = getCurrentInstall(Directories.inCommunity(props.mod.targetDirectory));
            console.log('Currently installed', manifest);

            let track = _.find(props.mod.tracks, { url: manifest.source });
            if (!track) {
                track = _.find(props.mod.tracks, { alternativeUrls: [manifest.source] });
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
                setSelectedTrack(props.mod.tracks[0]);
                return props.mod.tracks[0];
            } else {
                selectAndSetTrack(props.selectedTrack.key);
                return selectedTrack;
            }
        }
    };

    let installedTrack = props.installedTrack;
    const setInstalledTrack = (newInstalledTrack: ModTrack) => {
        installedTrack = newInstalledTrack;
        store.dispatch({ type: actionTypes.SET_INSTALLED_TRACK, payload: newInstalledTrack });
    };

    const selectedTrack = props.selectedTrack;
    const setSelectedTrack = (newSelectedTrack: ModTrack) => {
        store.dispatch({ type: actionTypes.SET_SELECTED_TRACK, payload: newSelectedTrack });
    };

    const installStatus = props.installStatus;
    const setInstallStatus = (new_state: InstallStatus) => {
        store.dispatch({ type: actionTypes.SET_INSTALL_STATUS, payload: new_state });
    };

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

    const isDownloading = !!download;

    useEffect(() => {
        const checkMsfsInterval = setInterval(async () => {
            setMsfsIsOpen(await Msfs.isRunning() ? MsfsStatus.Open : MsfsStatus.Closed);
        }, 500);

        return () => clearInterval(checkMsfsInterval);
    }, []);

    useEffect(() => {
        findInstalledTrack();
        if (!isDownloading) {
            getInstallStatus().then(setInstallStatus);
        }
    }, [selectedTrack, installedTrack]);

    const getInstallStatus = async (): Promise<InstallStatus> => {
        if (!selectedTrack) {
            return InstallStatus.Unknown;
        }

        console.log('Checking install status');

        const installDir = Directories.inCommunity(props.mod.targetDirectory);

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

    const downloadMod = async (track: ModTrack) => {
        // Initialize abort controller for downloads
        abortController = new AbortController();
        const signal = abortController.signal;

        setInstallStatus(InstallStatus.Downloading);
        dispatch(registerDownload(props.mod.name, `Downloading ${props.mod.name}`));

        const installMethod = new Fragmenter();
        installMethod.on('progress', progress => {
            dispatch(updateDownloadProgress(props.mod.name, progress.infoText, progress.buttonText, progress.canCancel, progress.percent));
        });

        try {
            const result = await installMethod.install(props.mod, track, signal, {
                forceCacheBust: !(settings.get('mainSettings.useCdnCache') as boolean),
                forceFreshInstall: false,
            });
            console.log('[INSTALL] Finished download', result);

            if (!result.aborted) {
                notifyDownload(true);
                setSelectedTrack(track);
                setInstalledTrack(track);
            }
        } catch (e) {
            console.error(e);
            notifyDownload(false);
        } finally {
            setTimeout(async () => {
                dispatch(deleteDownload(props.mod.name));
                setInstallStatus(await getInstallStatus());
            }, 3_000);
        }
    };

    const selectAndSetTrack = async (key: string) => {
        const newTrack = props.mod.tracks.find(x => x.key === key);
        setSelectedTrack(newTrack);
    };

    const handleTrackSelection = (track: ModTrack) => {
        if (!isDownloading) {
            dispatch(callWarningModal(track.isExperimental, track, !track.isExperimental, () => selectAndSetTrack(track.key)));
        } else {
            selectAndSetTrack(props.selectedTrack.key);
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

    const notifyDownload = (successful: boolean) => {
        console.log('Requesting notification');
        Notification.requestPermission().then(function () {
            console.log('Showing notification');
            if (successful) {
                new Notification('Download complete!', {
                    'body': "You're ready to fly",
                });
            } else {
                new Notification('Download failed!', {
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

    return (
        <div className={`bg-navy ${wait ? 'hidden' : 'visible'}`}>
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
                    {msfsIsOpen === MsfsStatus.Closed && isDownloading && <>
                        <ButtonContainer>
                            <StateText>{download.infoText}</StateText>
                            {download.canCancel ? <CancelButton onClick={handleCancel}>{download.buttonText}</CancelButton>
                                : <DisabledButton text={download.buttonText}/>}
                        </ButtonContainer>
                    </>}
                    {msfsIsOpen === MsfsStatus.Closed && !isDownloading && getInstallButton()}
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
                                props.mod.tracks.filter((track) => !track.isExperimental).map(track =>
                                    <Track
                                        mod={props.mod}
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
                                props.mod.tracks.filter((track) => track.isExperimental).map(track =>
                                    <Track
                                        mod={props.mod}
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
                        <p className="text-lg text-gray-300">{selectedTrack?.description ?? ''}</p>
                        <h3 className="font-semibold text-teal-50">Details</h3>
                        <p className="text-lg text-gray-300">{props.mod.description}</p>
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
