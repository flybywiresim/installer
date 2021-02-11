import React, { useEffect, useState } from 'react';
import store from '../../redux/store';
import { Typography } from 'antd';
import {
    ButtonsContainer as SelectionContainer,
    Content,
    Container,
    HeaderImage,
    InstallButton,
    ModelInformationContainer,
    ModelName,
    ModelSmallDesc,
    EngineOptionsContainer,
    EngineOption,
    DownloadProgress,
    UpdateButton,
    SwitchButton,
    InstalledButton,
    CancelButton,
    DetailsContainer,
    VersionHistoryContainer,
    LeftContainer,
    TopContainer,
    StateText,
    ButtonContainer,
    DisabledButton
} from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import net from "net";
import Zip from 'adm-zip';
import { getModReleases, Mod, ModTrack, ModVariant, ModVersion } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, RootStore } from 'renderer/redux/types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import _ from 'lodash';
import { Version, Versions } from "renderer/components/AircraftSection/VersionHistory";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";

const settings = new Store;

const { Paragraph } = Typography;

type Props = {
    mod: Mod
}

let controller: AbortController;
let signal: AbortSignal;

const UpdateReasonMessages = {
    NEW_RELEASE_AVAILABLE: "New release available",
    VERSION_CHANGED: "New version selected",
};

function showWarningModal() {
    const showWarningModal = true;
    store.dispatch({ type: 'SHOW_WARNING_MODAL', payload: {
        showWarningModal
    } });
}

const index: React.FC<Props> = (props: Props) => {
    const [selectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>(handleFindInstalledTrack());
    const [installedTrack, setInstalledTrack] = useState<ModTrack>(handleFindInstalledTrack());
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
    const [needsUpdateReason, setNeedsUpdateReason] = useState<string>();
    const [changeVersion, setChangeVersion] = useState<boolean>(false);

    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [installedStateText, setInstalledStateText] = useState('');
    const [isInstalledAsGitRepo, setIsInstalledAsGitRepo] = useState<boolean>(false);

    const [msfsIsOpen, setMsfsIsOpen] = useState<boolean>(true);
    const [hasCheckedStatus, setHasCheckedStatus] = useState<boolean>(false);

    const [wait, setWait] = useState(1);

    const [releases, setReleases] = useState<ModVersion[]>([]);

    useEffect(() => {
        getModReleases(props.mod).then(releases => {
            setReleases(releases);
            setWait(wait => wait - 1);
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
        checkForUpdates();
    }, [selectedTrack]);

    function findBuildTime(installDir: string) {
        const buildInfo = `${installDir}\\build_info.json`;
        if (fs.existsSync(buildInfo)) {
            const data = fs.readFileSync(`${installDir}\\build_info.json`, 'utf-8');
            const dataObject = JSON.parse(data);
            return dataObject.built;
        } else {
            return null;
        }
    }

    async function checkForUpdates() {
        const localLastTrack = settings.get('cache.' + props.mod.key + '.lastInstalledTrack');
        const localLastUpdate = settings.get('cache.' + props.mod.key + '.lastUpdated');
        const localLastBuildDate = settings.get('cache.' + props.mod.key + '.lastBuildTime');

        const res = await fetch(selectedTrack.url, { method: 'HEAD' });

        const webLastUpdate = res.headers.get('Last-Modified').toString();

        const installDir = `${settings.get('mainSettings.msfsPackagePath')}\\${props.mod.targetDirectory}\\`;

        setChangeVersion(false);

        if (fs.existsSync(installDir)) {
            setIsInstalled(true);
            console.log('Installed');

            // Check for git install
            console.log('Checking for git install');
            try {
                const symlinkPath = fs.readlinkSync(installDir);
                if (symlinkPath) {
                    if (fs.existsSync(symlinkPath + '\\..\\.git\\')) {
                        console.log('Is git repo');
                        setIsInstalledAsGitRepo(true);
                        return;
                    }
                }
            } catch {
                console.log('Is not git repo');
                setIsInstalledAsGitRepo(false);
            }

            console.log(`Checking for track '${selectedTrack.name}' being installed...`);
            if (typeof localLastTrack === "string") {
                if (localLastTrack !== selectedTrack.name) {
                    // The installed track is not the same - require update

                    setNeedsUpdate(false);
                    setIsInstalled(false);
                    setChangeVersion(true);
                } else {
                    // We are still on the same track - check the installed build

                    if (typeof localLastUpdate === "string") {
                        // There was an update before - check if that build is the latest

                        if (typeof localLastBuildDate === "string") {
                            if ((localLastUpdate === webLastUpdate) && (localLastBuildDate === findBuildTime(installDir))) {
                                setNeedsUpdate(false);
                                console.log("Is Updated");
                            } else {
                                setNeedsUpdate(true);
                                setNeedsUpdateReason(UpdateReasonMessages.NEW_RELEASE_AVAILABLE);
                                console.log("Is not Updated");
                            }
                        } else {
                            setNeedsUpdate(true);
                            setNeedsUpdateReason(UpdateReasonMessages.NEW_RELEASE_AVAILABLE);
                            console.log("Needs update to register build file to cache");
                        }
                    } else {
                        setIsInstalled(false);
                        console.log("Failed");
                    }
                }
            } else {
                // Don't know if the same track is installed - assume the worst
                setNeedsUpdate(true);
                setNeedsUpdateReason(UpdateReasonMessages.VERSION_CHANGED);
                console.log('Don\'t know which track');
            }

        } else {
            setIsInstalled(false);
            setNeedsUpdate(false);
            console.log('Not installed');
        }
    }

    function checkIfMSFS() {
        const socket = net.connect(500);

        socket.on('connect', () => {
            setMsfsIsOpen(true);
            setHasCheckedStatus(true);
            socket.destroy();
        });
        socket.on('error', () => {
            setMsfsIsOpen(false);
            setHasCheckedStatus(true);
            socket.destroy();
        });
    }

    async function downloadMod(track: ModTrack) {
        if (!isDownloading) {
            dispatch(registerDownload(props.mod.name));
            controller = new AbortController();
            signal = controller.signal;
            console.log("Downloading Track", track);
            const cancelCheck = new Promise((resolve) => {
                resolve(signal);
            });
            const msfsPackageDir = settings.get('mainSettings.msfsPackagePath');

            const fetchResp = await fetch("https://api.flybywiresim.com/api/v1/download?url=" + track.url, { redirect: "follow" });
            console.log("Starting Download");

            const respReader = fetchResp.body.getReader();
            const respLength = +fetchResp.headers.get('Content-Length');
            const respUpdateTime = fetchResp.headers.get('Last-Modified');

            let receivedLength = 0;
            const chunks = [];

            let lastPercentFloor = 0;

            for (;;) {
                try {
                    const { done, value } = await respReader.read();
                    cancelCheck.then((val: AbortSignal) => {
                        signal = val;
                    });
                    if (done || signal.aborted) {
                        break;
                    }

                    chunks.push(value);
                    receivedLength += value.length;

                    const newPercentFloor = (Math.floor((receivedLength / respLength) * 1000) / 10);

                    if (lastPercentFloor !== newPercentFloor) {
                        lastPercentFloor = newPercentFloor;
                        dispatch(updateDownloadProgress(props.mod.name, lastPercentFloor));
                    }
                } catch (e) {
                    if (e.name === 'AbortError') {
                        console.log('User aborted download');
                        break;
                    } else {
                        throw e;
                    }
                }
            }

            if (signal.aborted) {
                dispatch(updateDownloadProgress(props.mod.name, 0));
                return;
            }

            const chunksAll = new Uint8Array(respLength);
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            const compressedBuffer = Buffer.from(chunksAll);

            if (typeof msfsPackageDir === "string") {
                const zipFile = new Zip(compressedBuffer);
                const modInstallPath = `${msfsPackageDir}\\${props.mod.targetDirectory}`;

                if (fs.existsSync(modInstallPath)) {
                    fs.rmdirSync(modInstallPath, { recursive: true });
                }

                // Extract the ZIP
                zipFile.extractAllToAsync(msfsPackageDir, true, (error) => {
                    dispatch(deleteDownload(props.mod.name));

                    if (!error) {
                        dispatch(updateDownloadProgress(props.mod.name, 0));

                        // Set states
                        setIsInstalled(true);
                        setInstalledTrack(track);
                        setNeedsUpdate(false);

                        // Flash completion text
                        setInstalledStateText('Completed!');
                        setTimeout(() => setInstalledStateText(''), 3_000);

                        // Set appropriate cache keys
                        settings.set('cache.' + props.mod.key + '.lastUpdated', respUpdateTime);
                        settings.set('cache.' + props.mod.key + '.lastBuildTime', findBuildTime(modInstallPath));
                        settings.set('cache.' + props.mod.key + '.lastInstalledTrack', track.name);

                        console.log("Download complete!");
                        notifyDownload();
                    } else {
                        setInstalledStateText('Failed');
                        setTimeout(() => setInstalledStateText(''), 3_000);
                    }
                });
            }
        }
    }

    async function findAndSetTrack(key: string) {
        if (!isDownloading) {
            const newTrack = selectedVariant.tracks.find(x => x.key === key);
            setSelectedTrack(newTrack);
        }
    }

    function handleInstall() {
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadMod(selectedTrack);
        } else {
            setupInstallPath();
        }
    }

    function handleUpdate() {
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadMod(selectedTrack);
        } else {
            setupInstallPath();
        }
    }

    function handleCancel() {
        if (isDownloading) {
            console.log('Cancel download');
            controller.abort();
            dispatch(deleteDownload(props.mod.name));
        }
    }

    function notifyDownload() {
        Notification.requestPermission().then(function () {
            new Notification('Download complete!', {
                'body': "You're ready to fly",
            });
        }).catch(e => console.log(e));
    }

    function handleFindInstalledTrack() {
        const lastInstalledTrackName = settings.get('cache.' + props.mod.key + '.lastInstalledTrack');

        let lastInstalledTrack = null;

        props.mod.variants[0].tracks.map(track => {
            if (track.name === lastInstalledTrackName) {
                lastInstalledTrack = track;
            }
        });

        if (lastInstalledTrack) {
            return lastInstalledTrack;
        } else {
            return props.mod.variants[0]?.tracks[0];
        }
    }

    function getButtonText() {
        if (!isInstalledAsGitRepo && !isInstalled && !isDownloading && !changeVersion) {
            return "Install";
        } else if (!isInstalledAsGitRepo && !isInstalled && !isDownloading && changeVersion) {
            return "Switch version";
        } else if (isInstalledAsGitRepo && isInstalled) {
            return "Installed (git)";
        } else if (!isInstalledAsGitRepo && isInstalled && !needsUpdate && !isDownloading) {
            return "Installed";
        } else if (!isInstalledAsGitRepo && needsUpdate && !isDownloading) {
            return "Update";
        }
        return "";
    }

    return (
        <Container wait={wait}>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.mod.name}</ModelName>
                    <ModelSmallDesc>{props.mod.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {msfsIsOpen && <>
                        <ButtonContainer>
                            <StateText>{hasCheckedStatus ? "Please close MSFS" : "Checking status..."}</StateText>
                            <DisabledButton text={getButtonText()} />
                        </ButtonContainer>
                    </>}
                    {!msfsIsOpen && !isInstalledAsGitRepo && !isInstalled && !isDownloading && !changeVersion && <InstallButton onClick={handleInstall} />}
                    {!msfsIsOpen && !isInstalledAsGitRepo && !isInstalled && !isDownloading && changeVersion && <SwitchButton onClick={handleInstall} />}
                    {!msfsIsOpen && isInstalledAsGitRepo && isInstalled && <>
                        <ButtonContainer>
                            <StateText>{installedStateText}</StateText>
                            <InstalledButton inGitRepo={true} />
                        </ButtonContainer>
                    </>}
                    {!msfsIsOpen && !isInstalledAsGitRepo && isInstalled && !needsUpdate && !isDownloading && <>
                        <ButtonContainer>
                            <StateText>{installedStateText}</StateText>
                            <InstalledButton inGitRepo={false} />
                        </ButtonContainer>
                    </>}
                    {!msfsIsOpen && !isInstalledAsGitRepo && needsUpdate && !isDownloading && <>
                        <ButtonContainer>
                            <StateText>{needsUpdateReason}</StateText>
                            <UpdateButton onClick={handleUpdate} />
                        </ButtonContainer>
                    </>}
                    {isDownloading && <>
                        <ButtonContainer>
                            <StateText>{(Math.floor(download?.progress) >= 99) ? "Decompressing" : `${Math.floor(download?.progress)}%`}</StateText>
                            <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                        </ButtonContainer>
                    </>}
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
                                    <Track key={track.key} track={track} isSelected={selectedTrack === track} isInstalled={installedTrack === track} onSelected={track => findAndSetTrack(track.key)} />
                                )
                            }
                        </Tracks>
                    </div>
                    <div>
                        <h5>Experimental versions</h5>
                        <Tracks>
                            {
                                selectedVariant.tracks.filter(track => track.isExperimental).map(track =>
                                    <Track key={track.key} track={track} isSelected={selectedTrack === track} isInstalled={installedTrack === track} onSelected={showWarningModal} />
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
