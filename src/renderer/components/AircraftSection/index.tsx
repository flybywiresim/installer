import React, { useEffect, useState } from 'react';
import { Select, Typography, notification } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
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
    DownloadProgress
} from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import Zip from 'adm-zip';
import { Mod, ModTrack, ModVariant } from "renderer/components/App";
import { setupInstallPath } from 'renderer/actions/install-path.utils';

const settings = new Store;

const { Option } = Select;
const { Paragraph } = Typography;

type indexProps = {
    isDownloading: boolean,
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>,
    downloadPercentage: number,
    setDownloadPercentage: React.Dispatch<React.SetStateAction<number>>,
    isUpdated: boolean,
    setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>,
    mod: Mod,
}

let controller: AbortController;
let signal: AbortSignal;

const index: React.FC<indexProps> = (props: indexProps) => {
    const [selectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>(props.mod.variants[0]?.tracks[0]);
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    useEffect(() => {
        checkForUpdates(selectedTrack);
    }, []);

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
                    props.setIsUpdated(true);
                    setNeedsUpdate(false);
                } else {
                    setNeedsUpdate(true);
                    console.log("Is not Updated");
                    props.setIsUpdated(false);
                }
            } else {
                console.log("Failed");
                props.setIsUpdated(false);
            }
        } else {
            setIsInstalled(false);
            props.setIsUpdated(false);
        }
    }

    async function downloadMod(track: ModTrack) {
        if (!props.isDownloading) {
            controller = new AbortController();
            signal = controller.signal;
            console.log("Downloading Track", track);
            const cancelCheck = new Promise((resolve) => {
                resolve(signal);
            });
            props.setIsDownloading(true);
            props.setIsUpdated(false);
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
                        props.setDownloadPercentage(lastPercentFloor);
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
                props.setIsDownloading(false);
                props.setDownloadPercentage(0);
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
            props.setIsDownloading(false);
            props.setDownloadPercentage(0);
            setIsInstalled(true);
            props.setIsUpdated(true);
            console.log(props.mod.key);
            settings.set('cache.' + props.mod.key + '.lastUpdated', respUpdateTime);
            console.log("Download complete!");
            notification.open({
                placement: 'bottomRight',
                message: `${props.mod.aircraftName}/${track.name} download complete!`
            });
        }
    }

    async function findAndSetTrack(key: string) {
        const newTrack = selectedVariant.tracks.find(x => x.key === key);
        await checkForUpdates(newTrack);
        setSelectedTrack(newTrack);
    }

    function handleClick() {
        // check if install folder is set
        if (settings.has('mainSettings.msfsPackagePath')) {
            downloadMod(selectedTrack), cancelDownload();
        } else {
            setupInstallPath();
        }
    }

    function cancelDownload() {
        if (props.isDownloading) {
            console.log('Cancel download');
            controller.abort();
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
                        onSelect={item => findAndSetTrack(item.toString())}>
                        {
                            selectedVariant.tracks.map(version =>
                                <Option value={version.key} key={version.key}>{version.name}</Option>
                            )
                        }
                    </VersionSelect>
                    <InstallButton
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleClick}
                        style={
                            isInstalled ? (
                                needsUpdate ?
                                    {
                                        background: "#fa8c16",
                                        borderColor: "#fa8c16"
                                    } : {
                                        color: "#dddddd",
                                        background: "#2e995e",
                                        borderColor: "#2e995e",
                                        pointerEvents: "none"
                                    }
                            ) : {
                                background: "#00CB5D",
                                borderColor: "#00CB5D"
                            }
                        }
                    >{props.isDownloading ?
                            (props.downloadPercentage >= 99) ? "Decompressing" : `${props.downloadPercentage}% -  Cancel`
                            :
                            isInstalled ?
                                needsUpdate ? "Update" : "Installed"
                                :
                                "Install"
                        }
                    </InstallButton>
                </SelectionContainer>
            </HeaderImage>
            <DownloadProgress percent={props.downloadPercentage} showInfo={false} status="active" />
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
