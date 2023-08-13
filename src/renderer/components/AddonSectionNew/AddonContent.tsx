import React, { FC, useEffect } from "react";
import { useDataContext } from "renderer/utils/DataContext";
import { AddonTrack } from "renderer/utils/InstallerConfiguration";
import { useAppSelector } from "renderer/redux/store";
import { useDispatch } from "react-redux";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { InstallManager } from "renderer/utils/InstallManager";
import { setInstallStatus } from "renderer/redux/features/installStatus";
import { BackgroundServiceBanner, StateSection } from "renderer/components/AddonSection/StateSection";
import { Check } from "react-bootstrap-icons";
import { NavLink, Switch, Route, Redirect } from "react-router-dom";
import { LocalApiConfigEditUI } from "renderer/components/LocalApiConfigEditUI";

export const AddonContent: FC = () => {
    const dispatch = useDispatch();

    const { publisher, addon } = useDataContext();

    const installState = useAppSelector((state) => state.installStatus[addon?.key]);

    const selectedTrack = useAppSelector((state) => state.selectedTracks[addon?.key]);

    useEffect(() => {
        if (addon) {
            InstallManager.determineAddonInstallState(addon).then((installState) => {
                dispatch(setInstallStatus({ addonKey: addon.key, installState }));
            });
        }
    }, [addon, selectedTrack]);

    if (!addon) {
        return null;
    }

    if (!installState) {
        return null;
    }

    return (
        <div className="w-full flex flex-col">
            <div
                className="flex-shrink-0 relative bg-cover bg-center"
                style={{
                    height: '36vh',
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(23, 30, 44, 1.0)), url(${addon.backgroundImageUrls[0]})`,
                }}
            >
            </div>

            <div className="h-full relative mx-auto -mt-36 px-3 py-1" style={{ width: '870px' }}>
                <div className="h-full flex flex-col gap-y-7">
                    <div className="flex justify-between items-center">
                        <img className="h-20" src={addon.titleImageUrlSelected} />

                        {addon.backgroundService && (
                            <>
                                <BackgroundServiceBanner
                                    publisher={publisher}
                                    addon={addon}
                                    installState={installState}
                                />
                            </>
                        )}
                    </div>

                    <div className="w-full h-full flex flex-col bg-navy-dark rounded-2xl">
                        <div className="flex items-center gap-x-10 bg-navy-dark border-b border-navy-light px-8 py-6 rounded-t-2xl">
                            <NavLink to="./configure" className="text-3xl text-quasi-white hover:text-gray-300" activeClassName="text-3xl text-cyan-dark">
                                Configure
                            </NavLink>

                            <NavLink to="./release-notes" className="text-3xl text-quasi-white" activeClassName="text-3xl text-cyan-dark">
                                Release Notes
                            </NavLink>

                            <NavLink to="./about" className="text-3xl text-quasi-white" activeClassName="text-3xl text-cyan-dark">
                                About
                            </NavLink>

                            {publisher.key === 'flybywiresim' && addon.key === 'simbridge' && (
                                <NavLink to="./simbridge-options" className="text-3xl text-quasi-white ml-auto" activeClassName="text-cyan-dark">
                                    SimBridge Settings
                                </NavLink>
                            )}
                        </div>

                        <div className="px-8 py-4">
                            <Switch>
                                <Route path={`/addon-section/:publisherKey/:addonKey/configure`} component={ConfigurePage} />

                                <Route path={`/addon-section/:publisherKey/:addonKey/release-notes`} component={ReleaseNotesPage} />

                                <Route path={`/addon-section/:publisherKey/:addonKey/about`} component={AboutPage} />

                                <Route path={`/addon-section/:publisherKey/:addonKey/simbridge-options`} component={LocalApiConfigEditUI} />

                                <Route exact path={`/addon-section/:publisherKey/:addonKey`}>
                                    <Redirect to={`/addon-section/${publisher.key}/${addon.key}/configure`} />
                                </Route>
                            </Switch>
                        </div>

                        <div className="flex justify-end items-center gap-x-7 bg-navy-dark mt-auto">
                            <StateSection publisher={publisher} addon={addon} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfigurePage: FC = () => {
    const { addon } = useDataContext();

    const selectedTrack = useAppSelector((state) => state.selectedTracks[addon?.key]);

    return (
        <div className="flex justify-between gap-x-5">
            <div className="max-w-prose">
                <h3 className="text-quasi-white font-semibold">Choose Your Version</h3>

                <p className="text-quasi-white">{selectedTrack?.description}</p>
            </div>

            <div className="flex-grow flex flex-col gap-y-4">
                {addon.tracks.filter((it) => !it.isExperimental).map((track) => (
                    <TrackCard track={track} />
                ))}

                {addon.tracks.some((it) => it.isExperimental) && (
                    <>
                        <span className="text-2xl text-quasi-white">Experimental versions</span>

                        {addon.tracks.filter((it) => it.isExperimental).map((track) => (
                            <TrackCard track={track} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

interface TrackCardProps {
    track: AddonTrack,
}

const TrackCard: FC<TrackCardProps> = ({ track }) => {
    const { addon } = useDataContext();

    const dispatch = useDispatch();

    const selectedTrack = useAppSelector((state) => state.selectedTracks[addon?.key]);
    const installedTrack = useAppSelector((state) => state.installedTracks[addon?.key]);

    const version = useAppSelector((state) => state.latestVersionNames[addon?.key]?.[track.key]?.name ?? '<unknown>');

    if (!addon) {
        return null;
    }

    const isSelected = selectedTrack?.key === track.key;
    const isInstalled = installedTrack?.key === track.key;

    const borderStyle = isSelected ? 'border-cyan-dark' : 'border-transparent';
    const textStyle = isSelected ? 'text-cyan-dark' : 'text-quasi-white';

    const handleClick = () => {
        dispatch(setSelectedTrack({ addonKey: addon.key, track }));
    };

    return (
        <div key={track.key} className={`flex justify-between items-center px-5 py-4 bg-navy border-2 ${borderStyle} hover:border-gray-700 transition-colors duration-150 rounded-md cursor-pointer`} onClick={handleClick}>
            <div className="flex flex-col gap-y-2">
                <span className={`w-full text-2xl ${textStyle}`}>{track.name}</span>
                <span className={`w-full font-manrope font-semibold text-3xl ${textStyle} `}>{version}</span>
            </div>

            {isInstalled && <Check size={32} className="fill-current text-cyan-dark" />}
        </div>
    );
};

const ReleaseNotesPage: FC = () => {

    return (
        <div>
            bruh
        </div>
    );
};

const AboutPage: FC = () => {
    const { addon } = useDataContext();

    return (
        <div className="flex justify-between gap-x-5">
            <div className="max-w-prose">
                <h3 className="text-quasi-white font-semibold">About</h3>

                <p className="text-quasi-white">{addon.description}</p>
            </div>
        </div>
    );
};
