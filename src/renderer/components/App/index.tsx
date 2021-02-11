import { hot } from 'react-hot-loader';
import React, { useState } from 'react';
import { Layout, Menu, } from 'antd';
import SimpleBar from 'simplebar-react';

import Logo from 'renderer/components/LogoWithText';
import SettingsSection from 'renderer/components/SettingsSection';
import AircraftSection from 'renderer/components/AircraftSection';
import WindowActionButtons from 'renderer/components/WindowActionButtons';
import A320NoseSVG from 'renderer/assets/a32nx_nose.svg';
import A380NoseSVG from 'renderer/assets/a380x_nose.svg';
import CFMLeap1SVG from 'renderer/assets/cfm_leap1-a.svg';

import {
    AircraftMenuItem,
    Container,
    MainLayout,
    PageContent,
    PageHeader,
    PageSider,
    SettingsMenuItem
} from './styles';
import NoInternetModal from '../NoInternetModal';
import ChangelogModal from '../ChangelogModal';
import WarningModal from '../WarningModal';
import { GitVersions } from "@flybywiresim/api-client";

import { DataCache } from '../../utils/DataCache';

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
    enabled: boolean,
}

export type ModVersion = {
    title: string,
    date: Date,
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
    isExperimental: boolean,
    latestVersionName: Promise<ModVersion | string>
}

const releaseCache = new DataCache<ModVersion[]>('releases', 1000 * 3600 * 24);

/**
 * Obtain releases for a specific mod
 *
 * @param mod
 */
export const getModReleases = async (mod: Mod): Promise<ModVersion[]> => {
    const releases = await releaseCache.fetchOrCompute(async (): Promise<ModVersion[]> => {
        return (await GitVersions.getReleases('flybywiresim', mod.repoName))
            .filter(r => /v\d/.test(r.name))
            .map(r => ({ title: r.name, date: r.publishedAt, type: 'minor' }));
    });

    releases
        .forEach((version, index) => {
            const currentVersionTitle = version.title;
            const otherVersionTitle = index === releases.length - 1
                ? releases[index - 1].title
                : releases[index + 1].title;

            if (currentVersionTitle[1] !== otherVersionTitle[1]) {
                releases[index].type = 'major';
            } else if (currentVersionTitle[3] !== otherVersionTitle[3]) {
                releases[index].type = 'minor';
            } else if (currentVersionTitle[5] !== otherVersionTitle[5] && index === releases.length - 1) {
                releases[index].type = "minor";
            } else if (currentVersionTitle[5] !== otherVersionTitle[5]) {
                releases[index].type = 'patch';
            }
        });

    return releases;
};

const RELEASE_CACHE_LIMIT = 3600 * 1000 * 24;

function App() {
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
                    name: 'Neo (CFM LEAP-1A)',
                    key: 'LEAP',
                    imageUrl: CFMLeap1SVG,
                    imageAlt: "CFM Leap-1",
                    enabled: true,
                    tracks: [
                        {
                            name: 'Stable',
                            key: 'a32nx-stable',
                            url: 'https://flybywiresim-packages.b-cdn.net/stable/A32NX-stable.zip',
                            isExperimental: false,
                            get latestVersionName() {
                                return DataCache.from<string>('latest_version_stable', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getReleases('flybywiresim', 'a32nx'))[0].name);
                            },
                        },
                        {
                            name: 'Development',
                            key: 'a32nx-dev',
                            url: 'https://flybywiresim-packages.b-cdn.net/vmaster/A32NX-master.zip',
                            isExperimental: false,
                            get latestVersionName() {
                                return DataCache.from<string>('latest_version_dev', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getNewestCommit('flybywiresim', 'a32nx', 'master')).sha.substring(0, 7));
                            }
                        },
                        {
                            name: 'Custom FBW',
                            key: 'a32nx-fbw',
                            url: 'https://flybywiresim-packages.b-cdn.net/vmaster-cfbw/A32NX-master-cfbw.zip',
                            isExperimental: true,
                            get latestVersionName() {
                                return DataCache.from<string>('latest_version_fbw', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getNewestCommit('flybywiresim', 'a32nx', 'fbw')).sha.substring(0, 7));
                            },
                        },
                        {
                            name: 'Custom FBW+AP',
                            key: 'a32nx-ap',
                            url: 'https://flybywiresim-packages.b-cdn.net/vmaster-cfbw-cap/A32NX-master-cfbw-cap.zip',
                            isExperimental: true,
                            get latestVersionName() {
                                return DataCache.from<string>('latest_version_ap', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getNewestCommit('flybywiresim', 'a32nx', 'autopilot')).sha.substring(0, 7));
                            },
                        }
                    ],
                }
            ],
        },
        {
            name: 'A380X',
            repoName: 'a380x',
            aircraftName: 'A380',
            key: 'A380X',
            enabled: false,
            menuIconUrl: A380NoseSVG,
            backgroundImageUrls: [],
            shortDescription: 'Airbus A380-800',
            description: '',
            targetDirectory: 'A380',
            variants: [],
        }
    ];

    const [selectedItem, setSelectedItem] = useState<string>(mods[0].key);

    let sectionToShow;
    switch (selectedItem) {
        case 'settings':
            sectionToShow = <SettingsSection/>;
            break;

        default:
            sectionToShow = <AircraftSection mod={mods.find(x => x.key === selectedItem)}/>;
            break;
    }

    return (
        <>
            <NoInternetModal />
            <ChangelogModal />
            <WarningModal />
            <SimpleBar>
                <Container>
                    <MainLayout>
                        <PageHeader>
                            <Logo/>
                            <WindowActionButtons/>
                        </PageHeader>

                        <Layout className="site-layout">
                            <PageSider>
                                <Menu theme="dark" mode="inline" defaultSelectedKeys={[selectedItem]}
                                    onSelect={selectInfo => setSelectedItem(selectInfo.key.toString())}>
                                    {
                                        mods.map(mod =>
                                            <AircraftMenuItem mod={mod} key={mod.key} disabled={!mod.enabled} />
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
