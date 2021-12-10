import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from "renderer/components/Logo";
import SettingsSection from 'renderer/components/SettingsSection';
import DebugSection from 'renderer/components/DebugSection';
import AircraftSection from 'renderer/components/AircraftSection';

import { Container, MainLayout, PageHeader, PageSider, } from './styles';
import ChangelogModal from '../ChangelogModal';
import WarningModal from '../WarningModal';
import { GitVersions } from "@flybywiresim/api-client";
import { DataCache } from '../../utils/DataCache';
import * as actionTypes from '../../redux/actionTypes';
import store from '../../redux/store';
import { SetAddonAndTrackLatestReleaseInfo } from "renderer/redux/types";
import InstallerUpdate from "renderer/components/InstallerUpdate";
import { WindowButtons } from "renderer/components/WindowActionButtons";
import { Configuration, Addon, AddonVersion } from "renderer/utils/InstallerConfiguration";
import { AddonData } from "renderer/utils/AddonData";
import { ErrorModal } from '../ErrorModal';
import { NavBar, NavBarPublisher } from "renderer/components/App/NavBar";
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { AddonBar, AddonBarItem } from "renderer/components/App/AddonBar";
import { NoAvailableAddonsSection } from '../NoAvailableAddonsSection';

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
    const history = useHistory();

    const [addons] = useState<Addon[]>(
        configuration.publishers.reduce((arr, curr) => {
            arr.push(...curr.addons);
            return arr;
        }, [])
    );

    useEffect(() => {
        addons.forEach(fetchLatestVersionNames);
    }, []);

    const [selectedAddon, setSelectedAddon] = useState(addons[0]);
    const [selectedPublisher, setSelectedPublisher] = useState(configuration.publishers[0]);

    useEffect(() => {
        let firstAvailableAddon: Addon;

        selectedPublisher.addons.forEach(addon => {
            if (addon.enabled) {
                firstAvailableAddon = addon;
            }
        });

        if (!firstAvailableAddon) {
            history.push('/no-available-addons');
            return;
        }

        fetchLatestVersionNames(firstAvailableAddon).then(() => {
            setSelectedAddon(firstAvailableAddon);
        });
    }, [selectedPublisher]);

    console.log(configuration.publishers);
    console.log(addons);

    return (
        <>
            <ErrorModal/>
            <ChangelogModal />
            <WarningModal />
            <SimpleBar>
                <Container className="flex flex-row">
                    <MainLayout className="flex flex-col overflow-hidden">
                        <div className="absolute w-full h-10 z-50 flex flex-row pl-4 items-center bg-navy-dark shadow-xl">
                            <PageHeader className="h-full flex-1 flex flex-row items-stretch">
                                <Logo />
                            </PageHeader>

                            <InstallerUpdate />
                            <WindowButtons />
                        </div>

                        <div className="h-full pt-10 flex flex-row justify-start">
                            <div className="z-50 flex flex-row">
                                <NavBar>
                                    {configuration.publishers.map((publisher) => (
                                        <NavBarPublisher
                                            selected={selectedPublisher === publisher}
                                            publisher={publisher}
                                            onClick={() => setSelectedPublisher(publisher)}
                                        />
                                    ))}
                                </NavBar>
                                <PageSider className="flex-none bg-navy-medium shadow-2xl h-full" style={{ width: '26rem' }}>
                                    <div className="h-full flex flex-col divide-y divide-gray-700">
                                        <AddonBar publisher={selectedPublisher}>
                                            {selectedPublisher.addons.map((addon) => (
                                                <AddonBarItem selected={selectedAddon.key === addon.key && addon.enabled} enabled={addon.enabled} className="h-32" addon={addon} onClick={() => setSelectedAddon(addon)} />
                                            ))}
                                        </AddonBar>
                                    </div>
                                </PageSider>
                            </div>
                            <div className="bg-navy m-0 w-full">
                                <Switch>
                                    <Route exact path="/">
                                        <Redirect to="/aircraft-section"/>
                                    </Route>
                                    <Route path="/aircraft-section">
                                        <AircraftSection addon={addons.find(x => x.key === selectedAddon.key)}/>;
                                    </Route>
                                    <Route path="/debug">
                                        <DebugSection/>
                                    </Route>
                                    <Route path="/settings">
                                        <SettingsSection/>
                                    </Route>
                                    <Route path="/no-available-addons">
                                        <NoAvailableAddonsSection/>
                                    </Route>
                                </Switch>
                            </div>
                        </div>
                    </MainLayout>
                </Container>
            </SimpleBar>
        </>
    );
};

export default hot(module)(App);
