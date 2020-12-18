import React, { useEffect, useState } from 'react';
import { Select, Typography, notification } from 'antd';
import {
    ButtonsContainer as SelectionContainer,
    Content,
    Container,
    HeaderImage,
    InstallButton,
    ModelInformationContainer,
    ModelName,
    ModelSmallDesc,
    VersionSelect,
    EngineOptionsContainer,
    EngineOption,
    DownloadProgress,
    UpdateButton,
    InstalledButton,
    CancelButton
} from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import Zip from 'adm-zip';
import { Mod, ModTrack, ModVariant } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem, RootStore } from 'renderer/redux/types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDownload, registerDownload, updateDownloadProgress } from 'renderer/redux/actions/downloads.actions';
import _ from 'lodash';

const settings = new Store;

const { Option } = Select;

const { Paragraph } = Typography;

type Props = {
    mod: Mod
}

let controller: AbortController;
let signal: AbortSignal;

const index: React.FC<Props> = (props: Props) => {

    const [selectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>(props.mod.variants[0]?.tracks[0]);
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);

    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    const download: DownloadItem = useSelector((state: RootStore) => _.find(state.downloads, { id: props.mod.name }));
    const dispatch = useDispatch();

    const isDownloading = download?.progress >= 0;

    useEffect(() => {
        checkForUpdates(selectedTrack);

    },

    []);

    async function checkForUpdates(track: ModTrack) {
        const localLastUpdate = settings.get('cache.' + props.mod.key + '.lastUpdated');

        const res = await fetch(track.url, { method: 'HEAD' });

        const webLastUpdate = res.headers.get('Last-Modified').toString();

        const installDir = `${settings.get('mainSettings.msfsPackagePath')}\\${props.mod.targetDirectory}\\`;

        if (fs.existsSync(installDir)) {
            setIsInstalled(true);
            if (typeof localLastUpdate === "string") {
                if (localLastUpdate === webLastUpdate) {
                    console.log("Is Updated");
                    setNeedsUpdate(false);
                } else {
                    setNeedsUpdate(true);
                    console.log("Is not Updated");
                }
            } else {
                setIsInstalled(false);
                console.log("Failed");
            }
        } else {
            setIsInstalled(false);
        }
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
            const msfs_package_dir = settings.get('mainSettings.msfsPackagePath');

            const fetchResp = await fetch(track.url);
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

                    const newPercentFloor = Math.floor((receivedLength / respLength) * 100);

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

            if (typeof msfs_package_dir === "string") {
                const zipFile = new Zip(compressedBuffer);

                zipFile.extractAllTo(msfs_package_dir);
            }
            dispatch(updateDownloadProgress(props.mod.name, 0));
            setIsInstalled(true);
            setNeedsUpdate(false);
            console.log(props.mod.key);
            settings.set('cache.' + props.mod.key + '.lastUpdated', respUpdateTime);
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

    return (
        <Container>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.mod.name}</ModelName>
                    <ModelSmallDesc>{props.mod.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    <VersionSelect
                        styling={{ backgroundColor: '#00C2CB', color: 'white' }}
                        defaultValue={selectedTrack.name}
                        onSelect={item => findAndSetTrack(item.toString())}
                        disabled={isDownloading}>
                        {
                            selectedVariant.tracks.map(version =>
                                <Option value={version.key} key={version.key}>{version.name}</Option>
                            )
                        }
                    </VersionSelect>
                    {!isInstalled && !isDownloading && <InstallButton onClick={handleInstall} />}
                    {isInstalled && !needsUpdate && !isDownloading && <InstalledButton />}
                    {needsUpdate && !isDownloading && <UpdateButton onClick={handleUpdate}/>}
                    {isDownloading && <CancelButton onClick={handleCancel}>
                        {(download?.progress >= 99) ? "Decompressing" : `${download?.progress}% -  Cancel`}
                    </CancelButton>}
                </SelectionContainer>
            </HeaderImage>
            <DownloadProgress percent={download?.progress} showInfo={false} status="active" />
            <Content>
                <>
                    <h3>Details</h3>
                    <Paragraph style={{ color: '#858585' }}>{props.mod.description}</Paragraph>
                </>
                <EngineOptionsContainer>
                    <h3>Variants</h3>
                    {
                        props.mod.variants.map(variant =>
                            // TODO: Enable onClick when mod variants are available
                            <EngineOption key={variant.key} aria-disabled={!variant.enabled}>
                                <img src={variant.imageUrl} />
                                <span>{variant.name}</span>
                            </EngineOption>
                        )
                    }
                </EngineOptionsContainer>
            </Content>
        </Container>
    );
};

export default index;
