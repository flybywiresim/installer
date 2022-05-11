import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from "renderer/components/Logo";
import { SettingsSection } from 'renderer/components/SettingsSection';
import DebugSection from 'renderer/components/DebugSection';
import { AircraftSection } from 'renderer/components/AddonSection';
import { GitVersions } from "@flybywiresim/api-client";
import { DataCache } from '../../utils/DataCache';
import InstallerUpdate from "renderer/components/InstallerUpdate";
import { WindowButtons } from "renderer/components/WindowActionButtons";
import { Addon, AddonVersion } from "renderer/utils/InstallerConfiguration";
import { AddonData } from "renderer/utils/AddonData";
import { ErrorModal } from '../ErrorModal';
import { NavBar, NavBarPublisher } from "renderer/components/App/NavBar";
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { store, useAppSelector } from 'renderer/redux/store';
import { setAddonAndTrackLatestReleaseInfo } from 'renderer/redux/features/latestVersionNames';
import settings from 'common/settings';
import "./index.css";
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { ModalContainer } from '../Modal';

const releaseCache = new DataCache<AddonVersion[]>('releases', 1000 * 3600 * 24);

/**
 * Obtain releases for a specific addon
 *
 * @param addon
 */
export const getAddonReleases = async (addon: Addon): Promise<AddonVersion[]> => {
    const releases = (await releaseCache.fetchOrCompute(async (): Promise<AddonVersion[]> => {
        return (await GitVersions.getReleases(addon.repoOwner, addon.repoName))
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
    const dispatch = store.dispatch;

    for (const track of addon.tracks) {
        const trackLatestVersionName = await AddonData.latestVersionForTrack(addon, track);
        dispatch(setAddonAndTrackLatestReleaseInfo({
            addonKey: addon.key,
            trackKey: track.key,
            info: trackLatestVersionName,
        }));
    }
};

const App = () => {
    const history = useHistory();

    const configuration = useAppSelector(state => state.configuration);

    const [addons] = useState<Addon[]>(
        configuration.publishers.reduce((arr, curr) => {
            arr.push(...curr.addons);
            return arr;
        }, []),
    );

    useEffect(() => {
        addons.forEach(AddonData.configureInitialAddonState);
        addons.forEach(fetchLatestVersionNames);

        if (settings.get('cache.main.lastShownSection')) {
            history.push(settings.get('cache.main.lastShownSection'));
        }

        // Let's listen for a route change and set the last shown section to the incoming route pathname
        history.listen((location) => {
            settings.set("cache.main.lastShownSection", location.pathname);
        });
    }, []);

    useEffect(() => {
        const updateCheck = setInterval(() => {
            ipcRenderer.send(channels.checkForInstallerUpdate);
            addons.forEach(AddonData.checkForUpdates);
            addons.forEach(fetchLatestVersionNames);
        }, 5 * 60 * 1000);

        return () => clearInterval(updateCheck);
    }, []);

    return (
        <>
            <ErrorModal/>

            <ModalContainer />

            <SimpleBar>
                <div className="flex flex-col h-screen w-full">
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="absolute w-full h-12 z-50 flex flex-row pl-4 items-center bg-black draggable">
                            <div className="h-full flex-1 flex flex-row items-stretch">
                                <Logo />
                            </div>
                            <div className="flex flex-row not-draggable h-full">
                                <InstallerUpdate />
                                <WindowButtons />
                            </div>
                        </div>

                        <div className="h-full pt-10 flex flex-row justify-start">
                            <div className="z-40 h-full">
                                <NavBar>
                                    {configuration.publishers.map((publisher) => (
                                        <NavBarPublisher
                                            to={`/addon-section/${publisher.name}`}
                                            publisher={publisher}
                                        />
                                    ))}
                                </NavBar>
                            </div>

                            <div className="bg-navy m-0 w-full flex">
                                <Switch>
                                    <Route exact path="/">
                                        <Redirect to={`/addon-section/${configuration.publishers[0].name}`}/>
                                    </Route>
                                    <Route path="/addon-section/:publisherName">
                                        <AircraftSection />
                                    </Route>
                                    <Route exact path="/debug">
                                        <DebugSection />
                                    </Route>
                                    <Route path="/settings">
                                        <SettingsSection />
                                    </Route>
                                    <Route path="*">
                                        <Redirect to={'/'} />
                                    </Route>
                                </Switch>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleBar>
        </>
    );
};

export default hot(module)(App);
