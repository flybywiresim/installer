import React from 'react'
import { Select, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ButtonsContainer as SelectionContainer, Content, Container, HeaderImage, InstallButton, ModelInformationContainer, ModelName, ModelSmallDesc, AircraftModelSelect, VersionSelect, EngineOptionsContainer, EngineOption } from './styles';

const { Option } = Select;
const { Paragraph } = Typography;

const index: React.FC<{ aircraftModel: string }> = ({ aircraftModel }) => {
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
                    <VersionSelect defaultValue="0.4.2" style={{ width: 120 }}>
                        <Option value="dev">dev</Option>
                        <Option value="0.4.2">0.4.2</Option>
                        <Option value="0.4.1">0.4.1</Option>
                    </VersionSelect>
                    <InstallButton
                        type="primary"
                        style={{ background: "#00CB5D", borderColor: "#00CB5D" }}
                        loading={true}
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
