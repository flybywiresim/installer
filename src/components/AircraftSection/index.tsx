import React from 'react';
import { Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { ButtonsContainer as SelectionContainer, Content, Container, HeaderImage, InstallButton, ModelInformationContainer, ModelName, ModelSmallDesc, AircraftModelSelect, VersionSelect, EngineOptionsContainer, EngineOption, DownloadProgress } from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import Zip from 'adm-zip';

const { Option } = Select;
const { Paragraph } = Typography;

type a32nxVersion = {
    name: string,
    key: string,
    url: string,
}

type indexProps = {
    isDownloading: boolean,
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>,
    downloadPercentage: number,
    setDownloadPercentage: React.Dispatch<React.SetStateAction<number>>,
    aircraftModel: string,
}

const index: React.FC<indexProps> = (props: indexProps) => {
    const versions: a32nxVersion[] = [
        {
            name: 'Development',
            key: 'Development',
            url: 'https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/vmaster/A32NX-master.zip'
        },
        {
            name: 'Stable',
            key: 'Stable',
            url: '',
        }
    ];

    async function downloada32nx(version: a32nxVersion) {
        const settings = new Store;

        if (!props.isDownloading) {
            props.setIsDownloading(true);
            const msfs_package_dir = settings.get('mainSettings.msfsPackagePath');

            const deleteHandle = fs.rmdir(msfs_package_dir + 'A32NX\\', {recursive: true}, () => {
                console.log("Deleted original file");
            });

            const a32nxResp = await fetch(version.url).then((res) => {
                console.log("Starting Download");
                return res;
            });

            const a32nxReader = a32nxResp.body.getReader();
            const a32nxLength = +a32nxResp.headers.get('Content-Length');

            let a32nxRecievedLength = 0;
            const chunks = [];

            let lastPercentFloor = 0;

            for (;;) {
                const {done, value} = await a32nxReader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
                a32nxRecievedLength += value.length;

                const newPercentFloor = Math.floor((a32nxRecievedLength / a32nxLength) * 100);

                if (lastPercentFloor !== newPercentFloor) {
                    lastPercentFloor = newPercentFloor;
                    props.setDownloadPercentage(lastPercentFloor);
                }
            }

            const chunksAll = new Uint8Array(a32nxLength);
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            const a32nxCompressed = Buffer.from(chunksAll);

            if (typeof msfs_package_dir === "string") {
                const a32nx = new Zip(a32nxCompressed);

                await deleteHandle;

                a32nx.extractAllTo(msfs_package_dir);
            }
            props.setIsDownloading(false);
            props.setDownloadPercentage(0);
            console.log("Download complete!");
        }
    }

    return (
        <Container>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>
                        {props.aircraftModel}
                    </ModelName>
                    <ModelSmallDesc>
                        Airbus A320neo Series
                    </ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    {/** <AircraftModelSelect defaultValue="A320neo" style={{ width: 120 }}>
                        <Option value="A320neo">A320neo</Option>
                        <Option value="A321neo">A321neo</Option>
                        <Option value="A319">A319</Option>
                    </AircraftModelSelect> **/}
                    <VersionSelect defaultValue="Version" style={{ width: 130}}>
                        {
                            versions.map(version =>
                                <Option value={version.name} key={version.key}>{version.name}</Option>
                            )
                        }
                    </VersionSelect>
                    <InstallButton
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={props.isDownloading}
                        onClick={() => downloada32nx(versions[0])}
                        style={{ background: "#00CB5D", borderColor: "#00CB5D" }}
                    >{props.isDownloading ? `${props.downloadPercentage}%` : "Install"}</InstallButton>
                </SelectionContainer>
            </HeaderImage>
            <DownloadProgress percent={props.downloadPercentage} showInfo={false} status="active" />
            <Content>
                <>
                    <h3>Details</h3>
                    <Paragraph style={{ color: '#858585' }}>
                        The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain
                        its A320 product line’s position as the world’s most advanced and fuel-efficient single-aisle
                        aircraft family. The baseline A320neo jetliner has a choice of two new-generation engines
                        (the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International)
                        and features large, fuel-saving wingtip devices known as Sharklets.
                    </Paragraph>
                </>
                <EngineOptionsContainer>
                    <EngineOption image="https://d3lcr32v2pp4l1.cloudfront.net/Pictures/1024x536/3/5/3/74353_leapengine_665436.jpg">
                        Neo (CFM LEAP-1A) / (PW1100G-JM)
                    </EngineOption>
                    <EngineOption image="https://www.airport-data.com/images/aircraft/001/554/001554528.jpg" disabled>
                        Classic (CFM56) / (IAE-V2500)
                    </EngineOption>
                </EngineOptionsContainer>
            </Content>
        </Container>
    );
};

export default index;
