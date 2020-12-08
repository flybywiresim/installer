import { hot } from 'react-hot-loader';
import React, { useState } from 'react';

import { Layout, Menu, } from 'antd';
import Logo from '../LogoWithText';
import A320SVG from '../../assets/a32nx_nose.svg';
import A380SVG from '../../assets/a380x_nose.svg';
import { Container, PageHeader, HomeMenuItem, PageContent, PageSider, SettingsMenuItem, MainLayout, AircraftSubMenuItem, AircraftMenuItem, AircraftInstalledVersion, AircraftName, AircraftDetailsContainer } from './styles';
import HomeSection from '../HomeSection';
import SettingsSection from '../SettingsSection';
import AircraftSection from '../AircraftSection';
import WindowActionButtons from '../WindowActionButtons';

function App() {
    const [selectedItem, setSelectedItem] = useState<string>('1');

    let sectionToShow;
    switch (selectedItem) {
        case 'home':
            sectionToShow = <HomeSection />;
            break;
        case 'a32nx':
            sectionToShow = <AircraftSection aircraftModel="A32NX" />;
            break;
        case 'settings':
            sectionToShow = <SettingsSection />;
            break;

        default:
            sectionToShow = <HomeSection />;
            break;
    }

    return (
        <Container>
            <MainLayout>
                <PageHeader>
                    <Logo />
                    <WindowActionButtons />
                </PageHeader>

                <Layout className="site-layout">
                    <PageSider>
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={['home']} onSelect={selectInfo => setSelectedItem(selectInfo.key.toString())}>
                            <HomeMenuItem key="home">
                Home
                            </HomeMenuItem>
                            <AircraftMenuItem key="a32nx">
                                <AircraftDetailsContainer>
                                    <AircraftName>A320neo</AircraftName>
                                </AircraftDetailsContainer>
                                <img id="a320" src={A320SVG} />
                            </AircraftMenuItem>
                            <AircraftMenuItem key="a380x">
                                <AircraftDetailsContainer>
                                    <AircraftName>A380</AircraftName>
                                </AircraftDetailsContainer>
                                <img id="a380" src={A380SVG} />
                            </AircraftMenuItem>
                            <SettingsMenuItem key="settings">
                Settings
                            </SettingsMenuItem>
                        </Menu>
                    </PageSider>
                    <PageContent>
                        {sectionToShow}
                    </PageContent>
                </Layout>
            </MainLayout>
        </Container >
    );
}

export default hot(module)(App);
