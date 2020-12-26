import { hot } from 'react-hot-loader';
import React, { useState } from 'react';
import { Layout, Menu, } from 'antd';
import SimpleBar from 'simplebar-react';

import Logo from 'renderer/components/LogoWithText';
import HomeSection from 'renderer/components/HomeSection';
import SettingsSection from 'renderer/components/SettingsSection';
import AircraftSection from 'renderer/components/AircraftSection';
import WindowActionButtons from 'renderer/components/WindowActionButtons';
import A320NoseSVG from 'renderer/assets/a32nx_nose.svg';
import A380NoseSVG from 'renderer/assets/a380x_nose.svg';
import CFMLeap1SVG from 'renderer/assets/cfm_leap1-a.svg';

import {
    Container,
    PageHeader,
    HomeMenuItem,
    PageContent,
    PageSider,
    SettingsMenuItem,
    MainLayout,
    AircraftMenuItem,
    AircraftName,
    AircraftDetailsContainer
} from './styles';
import NoInternetModal from '../NoInternetModal';
import { GitHubApi } from "renderer/components/App/GitHubApi";

export type Mod = {
    name: string,
    repoName: string,
    aircraftName: string,
    key: string,
    backgroundImageUrls: string[],
    shortDescription: string,
    description: string,
    menuIconUrl: string,
    targetDirectory: string,
    variants: ModVariant[],
    versions: ModVersion[],
    enabled: boolean,
}

export type ModVersion = {
    title: string,
    date: string,
    type: 'major' | 'minor' | 'patch'
}

export type ModVariant = {
    name: string,
    key: string,
    imageUrl: string,
    imageAlt: string,
    enabled: boolean,
    tracks: ModTrack[],
}

export type ModTrack = {
    name: string,
    key: string,
    url: string,
}

/**
 * Obtain versions for a specific mod
 *
 * @param mod {Mod}
 */
const fillModVersions = (mod: Mod) => {
    GitHubApi.getVersions(mod)
        .then(versions => mod.versions = versions.filter(v => /v\d/.test(v.title)))
        .then(() => {
            mod.versions.forEach((version, index) => {
                const currentVersionTitle = version.title;
                const otherVersionTitle = index === mod.versions.length - 1
                    ? mod.versions[index - 1].title
                    : mod.versions[index + 1].title;

                if (currentVersionTitle[1] !== otherVersionTitle[1]) {
                    mod.versions[index].type = 'major';
                } else if (currentVersionTitle[3] !== otherVersionTitle[3]) {
                    mod.versions[index].type = 'minor';
                } else if (currentVersionTitle[5] !== otherVersionTitle[5]) {
                    mod.versions[index].type = 'patch';
                }
            });
        });
};

function App() {
    const [selectedItem, setSelectedItem] = useState<string>('home');

    const mods: Mod[] = [
        {
            name: 'A32NX',
            repoName: 'a32nx',
            aircraftName: 'A320neo',
            key: 'A32NX',
            enabled: true,
            menuIconUrl: A320NoseSVG,
            backgroundImageUrls: [
                'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png'
            ],
            shortDescription: 'Airbus A320neo Series',
            description: 'The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
                'its A320 product line’s position as the world’s most advanced and fuel-efficient single-aisle ' +
                'aircraft family. The baseline A320neo jetliner has a choice of two new-generation engines ' +
                '(the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International) ' +
                'and features large, fuel-saving wingtip devices known as Sharklets.',
            targetDirectory: 'A32NX',
            variants: [
                {
                    name: 'Neo (CFM LEAP-1A) / (PW1100G-JM)',
                    key: 'LEAP',
                    imageUrl: CFMLeap1SVG,
                    imageAlt: "CFM Leap-1",
                    enabled: true,
                    tracks: [
                        {
                            name: 'Development',
                            key: 'a32nx-dev',
                            url: 'https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/vmaster/A32NX-master.zip',
                        },
                        {
                            name: 'Stable',
                            key: 'a32nx-stable',
                            url: 'https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/stable/A32NX-stable.zip',
                        },
                        {
                            name: 'FBW',
                            key: 'a32nx-fbw',
                            url: 'https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/vmaster-cfbw/A32NX-master-cfbw.zip',
                        }
                    ],
                }
            ],
            versions: []
        },
        {
            name: 'A380',
            repoName: 'a380x',
            aircraftName: 'A380',
            key: 'A380',
            enabled: false,
            menuIconUrl: A380NoseSVG,
            backgroundImageUrls: [],
            shortDescription: 'Airbus A380-800',
            description: '',
            targetDirectory: 'A380',
            variants: [],
            versions: []
        }
    ];

    // Obtain mod versions

    mods.forEach(fillModVersions);

    let sectionToShow;
    switch (selectedItem) {
        case 'home':
            sectionToShow = <HomeSection/>;
            break;
        case 'settings':
            sectionToShow = <SettingsSection/>;
            break;

        default:
            sectionToShow = <AircraftSection mod={mods.find(x => x.key === selectedItem)}/>;
            break;
    }

    return (
        <>
            <NoInternetModal/>
            <SimpleBar>
                <Container>
                    <MainLayout>
                        <PageHeader>
                            <Logo/>
                            <WindowActionButtons/>
                        </PageHeader>

                        <Layout className="site-layout">
                            <PageSider>
                                <Menu theme="dark" mode="inline" defaultSelectedKeys={['home']}
                                    onSelect={selectInfo => setSelectedItem(selectInfo.key.toString())}>
                                    <HomeMenuItem key="home">Home</HomeMenuItem>
                                    {
                                        mods.map(mod =>
                                            <AircraftMenuItem key={mod.key} disabled={!mod.enabled}>
                                                <AircraftDetailsContainer>
                                                    <AircraftName>{mod.aircraftName}</AircraftName>
                                                </AircraftDetailsContainer>
                                                <img id={mod.key} src={mod.menuIconUrl} alt={mod.aircraftName}/>
                                            </AircraftMenuItem>
                                        )
                                    }
                                    <SettingsMenuItem key="settings">Settings</SettingsMenuItem>
                                </Menu>
                            </PageSider>
                            <PageContent>
                                {sectionToShow}
                            </PageContent>
                        </Layout>
                    </MainLayout>
                </Container>
            </SimpleBar>
        </>
    );
}

export default hot(module)(App);
