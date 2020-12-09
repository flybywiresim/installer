import React, {useEffect, useState} from 'react';
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
import {Mod, ModTrack, ModVariant} from "../App";

const settings = new Store;

const { Option } = Select;
const { Paragraph } = Typography;

type indexProps = {
    isDownloading: boolean,
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>,
    downloadPercentage: number,
    setDownloadPercentage: React.Dispatch<React.SetStateAction<number>>,
    mod: Mod,
}

const index: React.FC<indexProps> = (props: indexProps) => {
    const [selectedVariant, setSelectedVariant] = useState<ModVariant>(props.mod.variants[0]);
    const [selectedTrack, setSelectedTrack] = useState<ModTrack>(props.mod.variants[0]?.tracks[0]);
    const [isUpdated, setIsUpdated] = useState<boolean>(false);

    async function checkForUpdates() {
        {/* TODO: Implement the check version logic */}
        const localLastUpdate = settings.get('cache.' + props.mod.key + '.lastUpdated');

        // Should be HEAD instead of GET
        const res = await fetch(selectedTrack.url);

        const webLastUpdate = res.headers.get('Last-Modified').toString();

        const a32nxDir = `${settings.get('mainSettings.msfsPackagePath')}A32NX\\`;

        if (fs.existsSync(a32nxDir)) {
            if (typeof localLastUpdate === "string") {
                if (localLastUpdate === webLastUpdate) {
                    console.log("Is Updated");
                    setIsUpdated(true);
                } else {
                    console.log("Is not Updated");
                    setIsUpdated(false);
                }
            } else {
                console.log("Failed");
                setIsUpdated(false);
            }
        } else {
            setIsUpdated(false);
        }
    }

    async function downloadMod(track: ModTrack) {
        if (!props.isDownloading) {
            console.log("Downloading Track", track);

            props.setIsDownloading(true);
            const msfs_package_dir = settings.get('mainSettings.msfsPackagePath');

            const deleteHandle = fs.rmdir(msfs_package_dir + props.mod.targetDirectory + '\\', {recursive: true}, () => {
                console.log("Deleted original file");
            });

            const fetchResp = await fetch(track.url).then((res) => {
                console.log("Starting Download");
                return res;
            });

            const respReader = fetchResp.body.getReader();
            const respLength = +fetchResp.headers.get('Content-Length');
            const respUpdateTime = fetchResp.headers.get('Last-Modified');

            let receivedLength = 0;
            const chunks = [];

            let lastPercentFloor = 0;

            for (;;) {
                const {done, value} = await respReader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                const newPercentFloor = Math.floor((receivedLength / respLength) * 100);

                if (lastPercentFloor !== newPercentFloor) {
                    lastPercentFloor = newPercentFloor;
                    props.setDownloadPercentage(lastPercentFloor);
                }
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

                await deleteHandle;

                zipFile.extractAllTo(msfs_package_dir);
            }
            props.setIsDownloading(false);
            props.setDownloadPercentage(0);
            setIsUpdated(true);
            settings.set('cache.' + props.mod.key + '.lastUpdated', respUpdateTime);
            console.log("Download complete!");
            notification.open({
                placement: 'bottomRight',
                message: 'Download complete!'
              });
        }
    }

    function findAndSetTrack(key: string) {
        setSelectedTrack(selectedVariant.tracks.find(x => x.key === key));
    }

    useEffect(() => {
        checkForUpdates();
    });

    return (
        <Container>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>{props.mod.name}</ModelName>
                    <ModelSmallDesc>{props.mod.shortDescription}</ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {/** <AircraftModelSelect defaultValue="A320neo" style={{ width: 120 }}>
                        <Option value="A320neo">A320neo</Option>
                        <Option value="A321neo">A321neo</Option>
                        <Option value="A319">A319</Option>
                    </AircraftModelSelect> **/}
                    {/* TODO: Implement the check version logic */}
                    {/* <Button onClick={() => checkForA32nxUpdate(versions[0])}>Check for update</Button> */}
                    <VersionSelect defaultValue="Version" style={{ width: 130}}
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
                        loading={props.isDownloading}
                        onClick={() => downloadMod(selectedTrack)}
                        style={{ background: "#00CB5D", borderColor: "#00CB5D" }}
                    >{props.isDownloading ? `${props.downloadPercentage}%` : isUpdated ? "Installed" : "Install"}</InstallButton>
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
                            // TODO: Fix Click and disabled not working
                            <EngineOption key={variant.key} onClick={() => setSelectedVariant(variant)} aria-disabled={!variant.enabled}>
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
