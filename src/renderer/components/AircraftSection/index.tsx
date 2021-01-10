import React, { useEffect, useState } from 'react';
import { Typography, notification } from 'antd';
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
    InstalledButton,
    CancelButton, DetailsContainer, VersionHistoryContainer, LeftContainer, TopContainer, MSFSIsOpenButton
} from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import * as child_process from "child_process";
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

const index: React.FC<Props> = (props: Props) => {
    const [selectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>(handleFindInstalledTrack());
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);

    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isInstalledAsGitRepo, setIsInstalledAsGitRepo] = useState<boolean>(false);

    const [msfsIsOpen, setMsfsIsOpen] = useState<boolean>(false);

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
        checkForUpdates(selectedTrack);
        checkIfMSFS();
    }, []);

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

    async function checkForUpdates(track: ModTrack) {
        const localLastUpdate = settings.get('cache.' + props.mod.key + '.lastUpdated');
        const localLastBuildDate = settings.get('cache.' + props.mod.key + '.lastBuildTime');

        const res = await fetch(track.url, { method: 'HEAD' });

        const webLastUpdate = res.headers.get('Last-Modified').toString();

        const installDir = `${settings.get('mainSettings.msfsPackagePath')}\\${props.mod.targetDirectory}\\`;

        if (fs.existsSync(installDir)) {
            setIsInstalled(true);

            // Check for git install
            try {
                const symlinkPath = fs.readlinkSync(installDir);
                if (symlinkPath) {
                    if (fs.existsSync(symlinkPath + '\\..\\.git\\')) {
                        setIsInstalledAsGitRepo(true);
                        return;
                    }
                }
            } catch {
                setIsInstalledAsGitRepo(false);
            }

            if (typeof localLastUpdate === "string") {
                if (typeof localLastBuildDate === "string") {
                    if ((localLastUpdate === webLastUpdate) && (localLastBuildDate === findBuildTime(installDir))) {
                        console.log("Is Updated");
                        setNeedsUpdate(false);
                    } else {
                        setNeedsUpdate(true);
                        console.log("Is not Updated");
                    }
                } else {
                    setNeedsUpdate(true);
                    console.log("Needs update to register build file to cache");
                }
            } else {
                setIsInstalled(false);
                console.log("Failed");
            }
        } else {
            setIsInstalled(false);
        }
    }

    function checkIfMSFS() {
        child_process.exec('tasklist', (err, stdout) => {
            if (stdout.indexOf("FlightSimulator.exe") > -1) {
                setMsfsIsOpen(true);
            } else {
                setMsfsIsOpen(false);
            }
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

                zipFile.extractAllTo(msfsPackageDir);
                settings.set('cache.' + props.mod.key + '.lastBuildTime', findBuildTime(modInstallPath));
            }
            dispatch(updateDownloadProgress(props.mod.name, 0));
            setIsInstalled(true);
            setNeedsUpdate(false);
            console.log(props.mod.key);
            settings.set('cache.' + props.mod.key + '.lastUpdated', respUpdateTime);
            settings.set('cache.' + props.mod.key + '.lastInstalledTrack', track.name);
            console.log("Download complete!");
            notification.open({
                placement: 'bottomRight',
                message: `${props.mod.aircraftName}/${track.name} download complete!`
            });
            dispatch(deleteDownload(props.mod.name));
        }
    }

    async function findAndSetTrack(key: string) {
        const newTrack = selectedVariant.tracks.find(x => x.key === key);
        await checkForUpdates(newTrack);
        setSelectedTrack(newTrack);
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

    // function handleLastInstalledTrackName() {
    //     const name = settings.get('cache.' + props.mod.key + '.lastInstalledTrack');
    //
    //     if (typeof name === "string") {
    //         return name;
    //     } else {
    //         return "Development";
    //     }
    // }

    return (
        <Container wait={wait}>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.mod.name}</ModelName>
                    <ModelSmallDesc>{props.mod.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {msfsIsOpen && <MSFSIsOpenButton />}
                    {!msfsIsOpen && !isInstalledAsGitRepo && !isInstalled && !isDownloading && <InstallButton onClick={handleInstall} />}
                    {!msfsIsOpen && isInstalledAsGitRepo && isInstalled && <InstalledButton inGitRepo={true} />}
                    {!msfsIsOpen && !isInstalledAsGitRepo && isInstalled && !needsUpdate && !isDownloading && <InstalledButton inGitRepo={false} />}
                    {!msfsIsOpen && !isInstalledAsGitRepo && needsUpdate && !isDownloading && <UpdateButton onClick={handleUpdate}/>}
                    {isDownloading && <CancelButton onClick={handleCancel}>
                        {(Math.floor(download?.progress) >= 99) ? "Decompressing" : `${Math.floor(download?.progress)}% -  Cancel`}
                    </CancelButton>}
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
                                    <Track key={track.key} track={track} isSelected={selectedTrack === track} onSelected={track => findAndSetTrack(track.key)} />
                                )
                            }
                        </Tracks>
                    </div>
                    <div>
                        <h5>Experimental versions</h5>
                        <Tracks>
                            {
                                selectedVariant.tracks.filter(track => track.isExperimental).map(track =>
                                    <Track key={track.key} track={track} isSelected={selectedTrack === track} onSelected={track => findAndSetTrack(track.key)} />
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
