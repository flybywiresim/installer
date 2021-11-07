import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from "renderer/components/Logo";
import SettingsSection from 'renderer/components/SettingsSection';
import DebugSection from 'renderer/components/DebugSection';
import AircraftSection from 'renderer/components/AircraftSection';

import { Container, MainLayout, Content, PageHeader, PageSider, } from './styles';
import ChangelogModal from '../ChangelogModal';
import WarningModal from '../WarningModal';
import { GitVersions } from "@flybywiresim/api-client";
import { DataCache } from '../../utils/DataCache';
import * as actionTypes from '../../redux/actionTypes';
import store from '../../redux/store';
import { SetAddonAndTrackLatestReleaseInfo } from "renderer/redux/types";
import { Code, Settings } from "tabler-icons-react";
import { SidebarItem, SidebarAddon, SidebarPublisher } from "renderer/components/App/SideBar";
import InstallerUpdate from "renderer/components/InstallerUpdate";
import { WindowButtons } from "renderer/components/WindowActionButtons";
import { Configuration, Addon, AddonVersion } from "renderer/utils/InstallerConfiguration";
import { AddonData } from "renderer/utils/AddonData";
import { ErrorModal } from '../ErrorModal';

const releaseCache = new DataCache<AddonVersion[]>('releases', 1000 * 3600 * 24);

/**
 * Obtain releases for a specific addon
 *
 * @param addon
 */
export const getAddonReleases = async (addon: Addon): Promise<AddonVersion[]> => {
    const releases = (await releaseCache.fetchOrCompute(async (): Promise<AddonVersion[]> => {
        return (await GitVersions.getReleases('flybywiresim', addon.repoName))
            .filter(r => /v\d/.test(r.name))
            .map(r => ({ title: r.name, date: r.publishedAt, type: 'minor' }));
    })).map(r => ({ ...r, date: new Date(r.date) })); // Local Data cache returns a string instead of Date

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

export const fetchLatestVersionNames = async (addon: Addon): Promise<void> => {
    addon.tracks.forEach(async (track) => {
        const trackLatestVersionName = await AddonData.latestVersionForTrack(addon, track);

        store.dispatch<SetAddonAndTrackLatestReleaseInfo>({
            type: actionTypes.SET_ADDON_AND_TRACK_LATEST_RELEASE_INFO,
            payload: {
                addonKey: addon.key,
                trackKey: track.key,
                info: trackLatestVersionName,
            }
        });
    });
};

const App: React.FC<{ configuration: Configuration }> = ({ configuration }) => {
    const [addons] = useState<Addon[]>(
        configuration.publishers.reduce((arr, curr) => {
            arr.push(...curr.addons);
            return arr;
        }, [])
    );

    useEffect(() => {
        addons.forEach(fetchLatestVersionNames);
    }, []);

    const [selectedItem, setSelectedItem] = useState<string>(addons[0].key);

    let sectionToShow;
    switch (selectedItem) {
        case 'settings':
            sectionToShow = <SettingsSection />;
            break;

        case 'debug':
            sectionToShow = <DebugSection />;
            break;

        default:
            sectionToShow = <AircraftSection addon={addons.find(x => x.key === selectedItem)}/>;
            break;
    }

    return (
        <>
            <ErrorModal/>
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
                                    {
                                        configuration.publishers.map(publisher => (
                                            <SidebarPublisher name={publisher.name} logo={publisher.logoUrl}>
                                                {
                                                    publisher.addons.map(addon => (
                                                        <SidebarAddon
                                                            key={addon.key}
                                                            addon={addon}
                                                            isSelected={selectedItem === addon.key}
                                                            handleSelected={() => setSelectedItem(addon.key)}
                                                        />
                                                    ))
                                                }
                                            </SidebarPublisher>
                                        ))
                                    }

                                    <div className="mt-auto">
                                        {
                                            process.env.NODE_ENV === "development" &&
                                            <SidebarItem iSelected={selectedItem === 'debug'} onClick={() => setSelectedItem('debug')}>
                                                <Code className="text-gray-100 ml-2 mr-3" size={24} />

                                                <div className="flex flex-col">
                                                    <span className="text-lg text-gray-200 font-semibold">Debug</span>
                                                </div>
                                            </SidebarItem>
                                        }

                                        <SidebarItem iSelected={selectedItem === 'settings'} onClick={() => setSelectedItem('settings')}>
                                            <Settings className="text-gray-100 ml-2 mr-3" size={24} />

                                            <div className="flex flex-col">
                                                <span className="text-lg text-gray-200 font-semibold">Settings</span>
                                            </div>
                                        </SidebarItem>
                                    </div>

                                </div>
                            </PageSider>
                            <Content className="overflow-y-scroll bg-navy m-0">
                                {sectionToShow}
                            </Content>
                        </div>
                    </MainLayout>
                </Container>
            </SimpleBar>
        </>
    );
};

export default hot(module)(App);
