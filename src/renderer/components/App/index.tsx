import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from "renderer/components/Logo";
import SettingsSection from 'renderer/components/SettingsSection';
import AircraftSection from 'renderer/components/AircraftSection';

import logo from 'renderer/assets/FBW-Tail.svg';

import { Container, MainLayout, PageContent, PageHeader, PageSider, } from './styles';
import ChangelogModal from '../ChangelogModal';
import WarningModal from '../WarningModal';
import { GitVersions } from "@flybywiresim/api-client";
import { DataCache } from '../../utils/DataCache';
import * as actionTypes from '../../redux/actionTypes';
import store from '../../redux/store';
import { SetModAndTrackLatestVersionName } from "renderer/redux/types";
import { Settings } from "tabler-icons-react";
import { SidebarItem, SidebarMod, SidebarPublisher } from "renderer/components/App/SideBar";
import InstallerUpdate from "renderer/components/InstallerUpdate";
import { WindowButtons } from "renderer/components/WindowActionButtons";
import { Configuration, Mod, ModVersion } from "renderer/utils/InstallerConfiguration";

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

export const fetchLatestVersionNames = async (mod: Mod): Promise<void> => {
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

const App: React.FC<{ configuration: Configuration }> = ({ configuration }) => {
    useEffect(() => {
        configuration.mods.forEach(fetchLatestVersionNames);
    }, []);

    const [selectedItem, setSelectedItem] = useState<string>(configuration.mods[0].key);

    let sectionToShow;
    switch (selectedItem) {
        case 'settings':
            sectionToShow = <SettingsSection/>;
            break;

        default:
            sectionToShow = <AircraftSection mod={configuration.mods.find(x => x.key === selectedItem)}/>;
            break;
    }

    return (
        <>
            <ChangelogModal />
            <WarningModal />
            <SimpleBar>
                <Container>
                    <MainLayout className="overflow-hidden">
                        <div className="absolute w-full h-14 z-50 flex flex-row pl-5 items-center bg-navy-400 shadow-xl">
                            <PageHeader className="h-full flex-1 flex flex-row items-stretch">
                                <Logo />
                                <InstallerUpdate />
                            </PageHeader>

                            <WindowButtons />
                        </div>

                        <div className="h-full pt-14 flex flex-row justify-start">
                            <PageSider className="w-72 z-40 flex-none bg-navy-medium shadow-2xl">
                                <div className="h-full flex flex-col divide-y divide-gray-700">
                                    <SidebarPublisher name="FlyByWire Simulations" logo={logo}>
                                        {
                                            configuration.mods.map(mod => {
                                                return (
                                                    <SidebarMod
                                                        key={mod.key}
                                                        mod={mod}
                                                        isSelected={selectedItem === mod.key}
                                                        handleSelected={() => setSelectedItem(mod.key)}
                                                    />
                                                );
                                            })
                                        }
                                    </SidebarPublisher>

                                    <SidebarItem className="mt-auto" iSelected={selectedItem === 'settings'} onClick={() => setSelectedItem('settings')}>
                                        <Settings className="text-gray-100 ml-2 mr-3" size={24} />

                                        <div className="flex flex-col">
                                            <span className="text-lg text-gray-200 font-semibold">Settings</span>
                                        </div>
                                    </SidebarItem>
                                </div>
                            </PageSider>
                            <PageContent>
                                {sectionToShow}
                            </PageContent>
                        </div>
                    </MainLayout>
                </Container>
            </SimpleBar>
        </>
    );
};

export default hot(module)(App);
