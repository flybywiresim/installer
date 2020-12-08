import React, {useState} from 'react'
import { Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { ButtonsContainer as SelectionContainer, Content, Container, HeaderImage, InstallButton, ModelInformationContainer, ModelName, ModelSmallDesc, AircraftModelSelect, VersionSelect, EngineOptionsContainer, EngineOption } from './styles';
import Store from 'electron-store';
import * as fs from "fs";
import Zip from 'adm-zip';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require('electron').remote;

const { Option } = Select;
const { Paragraph } = Typography;

type a32nxVersion = {
    name: string,
    url: string,
}

const index: React.FC<{ aircraftModel: string }> = ({ aircraftModel }) => {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const versions: a32nxVersion[] = [
        {
            name: 'dev',
            url: 'https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/vmaster/A32NX-master.zip'
        },
        {
            name: 'stable',
            url: '',
        }
    ]

    async function downloada32nx(version: a32nxVersion) {
        const settings = new Store;

        if (!isDownloading) {
            setIsDownloading(true);
            const msfs_package_dir = settings.get('mainSettings.msfsPackagePath');

            const deleteHandle = fs.rmdir(msfs_package_dir + 'A32NX\\', {recursive: true}, () => {
                console.log("Deleted original file");
            });

            const a32nxBuf = await fetch(version.url).then((res) => {
                console.log("Starting Download");
                return res.arrayBuffer();
            });

            const a32nxCompressed = Buffer.from(new Uint8Array(a32nxBuf));


            if (typeof msfs_package_dir === "string") {
                const a32nx = new Zip(a32nxCompressed);

                await deleteHandle;

                a32nx.extractAllTo(msfs_package_dir);
            }
            setIsDownloading(false);
            console.log("Download complete!");
        }
    }

    return (
        <Container>
            <HeaderImage>
                <ModelInformationContainer>
                    <ModelName>
                        {aircraftModel}
                    </ModelName>
                    <ModelSmallDesc>
                        Airbus A320neo Series
                    </ModelSmallDesc>
                </ModelInformationContainer>
                <SelectionContainer>
                    <AircraftModelSelect defaultValue="A320neo" style={{ width: 120 }}>
                        <Option value="A320neo">A320neo</Option>
                        <Option value="A321neo">A321neo</Option>
                        <Option value="A319">A319</Option>
                    </AircraftModelSelect>
                    <VersionSelect defaultValue="dev" style={{ width: 120 }}>
                        {
                            versions.map(version =>
                                <Option value={version.name}>{version.name}</Option>
                            )
                        }
                    </VersionSelect>
                    <InstallButton
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={isDownloading}
                        onClick={() => downloada32nx(versions[0])}
                        style={{ background: "#00CB5D", borderColor: "#00CB5D" }}
                    >Install</InstallButton>
                </SelectionContainer>
            </HeaderImage>
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
                        Neo (CFM LEAP-1A)
                    </EngineOption>
                    <EngineOption image="https://www.airport-data.com/images/aircraft/001/554/001554528.jpg" disabled>
                        Classic (IAE-V2500)
                    </EngineOption>
                </EngineOptionsContainer>
            </Content>
        </Container>
    )
}

export default index;
