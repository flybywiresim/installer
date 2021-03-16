import { hot } from 'react-hot-loader';
import React, { useState } from 'react';
import { shell } from "electron";
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
    DragRegion,
    MainLayout,
    PageContent,
    PageHeader,
    PageSider,
    SettingsMenuItem
} from './styles';
import ChangelogModal from '../ChangelogModal';
import WarningModal from '../WarningModal';
import { GitVersions } from "@flybywiresim/api-client";

import { DataCache } from '../../utils/DataCache';
import * as actionTypes from '../../redux/actionTypes';
import store from '../../redux/store';
import { SetModAndTrackLatestVersionName } from "renderer/redux/types";

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

type BaseModTrack = {
    name: string,
    key: string,
    url: string,
    description: JSX.Element,
    fetchLatestVersionName: () => Promise<string>
}

export type MainlineModTrack = BaseModTrack & { isExperimental: false }

export type ExperimentalModTrack = BaseModTrack & { isExperimental: true, warningContent: JSX.Element }

export type ModTrack = MainlineModTrack | ExperimentalModTrack;

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

export const fetchLatestVersionNames = async (mod: Mod) => {
    if (mod.variants.length > 0) {
        mod.variants[0].tracks.forEach(async (track) => {
            store.dispatch<SetModAndTrackLatestVersionName>({
                type: actionTypes.SET_MOD_AND_TRACK_LATEST_VERSION_NAME,
                payload: {
                    modKey: mod.key,
                    trackKey: track.key,
                    name: await track.fetchLatestVersionName()
                }
            });
        });
    }
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
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/stable',
                            description:
                                <>
                                    <p>
                                        Stable is our variant that has the least bugs and best performance. This version will not
                                        always be up to date but we guarantee it's compatibility with each major patch from MSFS.
                                    </p>
                                </>,
                            isExperimental: false,
                            fetchLatestVersionName() {
                                return DataCache.from<string>('latest_version_stable', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getReleases('flybywiresim', 'a32nx'))[0].name);
                            },
                        },
                        {
                            name: 'Development',
                            key: 'a32nx-dev',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/master',
                            description:
                                <>
                                    <p>
                                        Development will have the latest features that will end up in the next stable.
                                        Bugs are to be expected. It updates whenever something is added to the 'master' branch on Github.
                                        Please visit our discord for support.
                                    </p>
                                </>,
                            isExperimental: false,
                            fetchLatestVersionName() {
                                return DataCache.from<string>('latest_version_dev', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getNewestCommit('flybywiresim', 'a32nx', 'master')).sha.substring(0, 7));
                            }
                        },
                        {
                            name: 'Custom FBW',
                            key: 'a32nx-fbw',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                            description:
                                <>
                                    <p>
                                        The Custom FBW version is exactly the same as Development but it contains our own Custom Fly-By-Wire system.
                                        This version is updated whenever the 'fbw' branch on Github is updated, which is around every 12 hours.
                                    </p>
                                </>,
                            isExperimental: true,
                            warningContent:
                                <>
                                    <p>The custom fly-by-wire version contains an experimental handling system that more closely matches real-life controls in an A320neo. This system is in development and bugs are to be expected.</p>
                                    <p>To understand what you are getting into and the potential issues you might experience, please read <a onClick={() => shell.openExternal("https://github.com/flybywiresim/a32nx/blob/fbw/docs/README.md")}>this guide</a>.</p>

                                    <p style={{ marginTop: '1em', fontWeight: 'bold' }}>Please be aware that no support will be offered via Discord help channels.</p>
                                </>,
                            fetchLatestVersionName() {
                                return DataCache.from<string>('latest_version_fbw', RELEASE_CACHE_LIMIT)
                                    .fetchOrCompute(async () => (await GitVersions.getNewestCommit('flybywiresim', 'a32nx', 'fbw')).sha.substring(0, 7));
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

    mods.forEach(fetchLatestVersionNames);

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
            <ChangelogModal />
            <WarningModal />
            <SimpleBar>
                <Container>
                    <MainLayout>
                        <PageHeader>
                            <DragRegion/>
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
