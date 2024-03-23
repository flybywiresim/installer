import React, { FC, useCallback, useEffect, useState } from "react";
import { setupInstallPath } from "renderer/actions/install-path.utils";
import { DownloadItem } from "renderer/redux/types";
import { useSelector } from "react-redux";
import { getCurrentInstall } from "@flybywiresim/fragmenter";
import { InstallerStore, useAppDispatch, useAppSelector } from "../../redux/store";
import { Addon, AddonCategoryDefinition, AddonTrack } from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { NavLink, Redirect, Route, useHistory, useParams } from "react-router-dom";
import { Gear, InfoCircle, JournalText, Sliders } from "react-bootstrap-icons";
import settings, { useSetting } from "common/settings";
import { ipcRenderer } from "electron";
import { AddonBar, AddonBarItem } from "../App/AddonBar";
import { NoAvailableAddonsSection } from "../NoAvailableAddonsSection";
import { ReleaseNotes } from "./ReleaseNotes";
import { setInstalledTrack } from 'renderer/redux/features/installedTrack';
import { InstallState, setInstallStatus } from "renderer/redux/features/installStatus";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { PromptModal, useModals } from "renderer/components/Modal";
import ReactMarkdown from "react-markdown";
import { Button, ButtonType } from "renderer/components/Button";
import { MainActionButton } from "renderer/components/AddonSection/MainActionButton";
import { ApplicationStatus, InstallStatus, InstallStatusCategories } from "renderer/components/AddonSection/Enums";
import { setApplicationStatus } from "renderer/redux/features/applicationStatus";
import { LocalApiConfigEditUI } from "../LocalApiConfigEditUI";
import { Configure } from "renderer/components/AddonSection/Configure";
import { InstallManager } from "renderer/utils/InstallManager";
import { StateSection } from "renderer/components/AddonSection/StateSection";
import { ExternalApps } from "renderer/utils/ExternalApps";
import { MyInstall } from "renderer/components/AddonSection/MyInstall";

const abortControllers = new Array<AbortController>(20);
abortControllers.fill(new AbortController);

interface InstallButtonProps {
    type?: ButtonType,
    disabled?: boolean,
    className?: string;
    onClick?: () => void;
}

export const SidebarButton: FC<InstallButtonProps> = ({
    type = ButtonType.Neutral,
    disabled = false,
    onClick,
    children,
}) => (
    <Button
        type={type}
        disabled={disabled}
        className={`w-64`}
        onClick={onClick}
    >
        {children}
    </Button>
);

interface SideBarLinkProps {
    to: string;
    disabled?: boolean;
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children, disabled = false }) => (
    <NavLink
        className={`w-full flex flex-row items-center gap-x-5 text-2xl ${disabled ? 'text-gray-500' : 'text-white'} font-manrope font-bold hover:text-cyan no-underline`}
        activeClassName="text-cyan"
        to={to}
        style={{ pointerEvents: disabled ? 'none' : 'unset' }}
    >
        {children}
    </NavLink>
);

export interface AircraftSectionURLParams {
    publisherName: string;
}

export const AddonSection = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const { publisherName } = useParams<AircraftSectionURLParams>();
    const publisherData = useAppSelector(state => state.configuration.publishers.find(pub => pub.name === publisherName) ? state.configuration.publishers.find(pub => pub.name === publisherName) : state.configuration.publishers[0]);

    const [selectedAddon, setSelectedAddon] = useState<Addon>(() => {
        try {
            return publisherData.addons[0];
        } catch (e) {
            throw new Error('Invalid publisher key: ' + publisherName);
        }
    });

    const [hiddenAddon, setHiddenAddon] = useState<Addon | undefined>(undefined);

    const installedTracks = useAppSelector(state => state.installedTracks);
    const selectedTracks = useAppSelector(state => state.selectedTracks);
    const installStates = useAppSelector(state => state.installStatus);
    const releaseNotes = useAppSelector(state => state.releaseNotes[selectedAddon.key]);

    useEffect(() => {
        const hiddenAddon = publisherData.addons.find((addon) => addon.key === selectedAddon.hidesAddon);

        if (hiddenAddon) {
            setHiddenAddon(hiddenAddon);
            history.push(`/addon-section/${publisherName}/hidden-addon-cover`);
        } else {
            setHiddenAddon(undefined);
            history.push(`/addon-section/${publisherName}/main/configure/release-track`);
        }

        settings.set('cache.main.lastShownAddonKey', selectedAddon.key);
    }, [selectedAddon]);

    useEffect(() => {
        const firstAvailableAddon = publisherData.addons.find((addon) => addon.enabled);

        if (!firstAvailableAddon) {
            history.push(`/addon-section/${publisherName}/no-available-addons`);
            return;
        }

        const lastSeenAddonKey = settings.get('cache.main.lastShownAddonKey');
        const addonToSelect = publisherData.addons.find(addon => addon.key === lastSeenAddonKey) || publisherData.addons.find(addon => addon.key === firstAvailableAddon.key);

        setSelectedAddon(addonToSelect);
    }, [publisherName]);

    const findInstalledTrack = (): AddonTrack => {
        if (!Directories.isFragmenterInstall(selectedAddon)) {
            console.log("Not installed");
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setCurrentlySelectedTrack(selectedAddon.tracks[0]);
                return selectedAddon.tracks[0];
            }
        }

        try {
            const manifest = getCurrentInstall(
                Directories.inInstallLocation(selectedAddon.targetDirectory),
            );
            console.log("Currently installed", manifest);

            let track = selectedAddon.tracks.find(track => track.url.includes(manifest.source));
            if (!track) {
                track = selectedAddon.tracks.find(track => track.alternativeUrls?.includes(manifest.source));
            }

            console.log("Currently installed", track);
            setCurrentlyInstalledTrack(track);
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setCurrentlySelectedTrack(track);
                return track;
            }
        } catch (e) {
            console.error(e);
            console.log("Not installed");
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setCurrentlySelectedTrack(selectedAddon.tracks[0]);
                return selectedAddon.tracks[0];
            }
        }
    };

    const installedTrack = (): AddonTrack => {
        try {
            return installedTracks[selectedAddon.key] as AddonTrack;
        } catch (e) {
            setCurrentlyInstalledTrack(null);
            return null;
        }
    };

    const setCurrentlyInstalledTrack = (newInstalledTrack: AddonTrack) => {
        dispatch(setInstalledTrack({ addonKey: selectedAddon.key, installedTrack: newInstalledTrack }));
    };

    const selectedTrack = (): AddonTrack => {
        try {
            return selectedTracks[selectedAddon.key] as AddonTrack;
        } catch (e) {
            setCurrentlySelectedTrack(null);
            return null;
        }
    };

    const setCurrentlySelectedTrack = (newSelectedTrack: AddonTrack) => {
        dispatch(setSelectedTrack({ addonKey: selectedAddon.key, track: newSelectedTrack }));
    };

    const getCurrentInstallStatus = (): InstallState => {
        try {
            return installStates[selectedAddon.key];
        } catch (e) {
            setCurrentInstallStatus({ status: InstallStatus.Unknown });
            return { status: InstallStatus.Unknown };
        }
    };

    const setCurrentInstallStatus = (new_state: InstallState) => {
        dispatch(setInstallStatus({ addonKey: selectedAddon.key, installState: new_state }));
    };

    const download: DownloadItem = useSelector((state: InstallerStore) =>
        state.downloads.find(download => download.id === selectedAddon.key),
    );

    const isDownloading = download?.progress.totalPercent >= 0;
    const status = getCurrentInstallStatus()?.status;
    const isInstalling = InstallStatusCategories.installing.includes(status);
    const isFinishingDependencyInstall = status === InstallStatus.InstallingDependencyEnding;

    useEffect(() => {
        const checkApplicationInterval = setInterval(async () => {
            // Map app references to definition objects
            const disallowedRunningExternalApps = ExternalApps.forAddon(selectedAddon, publisherData);

            for (const app of disallowedRunningExternalApps ?? []) {
                // Determine what state the app is in
                let state = false;
                switch (app.detectionType) {
                    case 'ws':
                        state = await ExternalApps.determineStateWithWS(app);
                        break;
                    case 'http':
                        state = await ExternalApps.determineStateWithHttp(app);
                        break;
                    case 'tcp':
                        state = await ExternalApps.determineStateWithTcp(app);
                        break;
                }

                // Dispatch the app's state
                dispatch(setApplicationStatus({
                    applicationName: app.key,
                    applicationStatus: state ? ApplicationStatus.Open : ApplicationStatus.Closed,
                }));
            }
        }, 500);

        return () => clearInterval(checkApplicationInterval);
    }, [selectedAddon]);

    useEffect(() => {
        findInstalledTrack();
        if (!isInstalling) {
            InstallManager.determineAddonInstallState(selectedAddon).then(setCurrentInstallStatus);
        }
    }, [selectedAddon, selectedTrack(), installedTrack()]);

    useEffect(() => {
        if (download && isDownloading) {
            ipcRenderer.send("set-window-progress-bar", download.progress.totalPercent / 100);
        } else {
            ipcRenderer.send("set-window-progress-bar", -1);
        }
    }, [download]);

    const [addonDiscovered] = useSetting<boolean>(
        "cache.main.discoveredAddons." + hiddenAddon?.key,
    );

    useEffect(() => {
        if (addonDiscovered) {
            setSelectedAddon(hiddenAddon);
        }
    }, [addonDiscovered]);

    useEffect(() => {
        const autoUpdateEnabled = settings.get("mainSettings.useAutoUpdate");
    
        if (autoUpdateEnabled && status === InstallStatus.NeedsUpdate) {
            handleInstall();
        }
    }, [status]);

    const { showModal, showModalAsync } = useModals();

    const selectAndSetTrack = (key: string) => {
        const newTrack = selectedAddon.tracks.find((track) => track.key === key);
        setCurrentlySelectedTrack(newTrack);
    };

    const handleTrackSelection = (track: AddonTrack) => {
        if (!isInstalling) {
            if (track.isExperimental) {
                showModal(
                    <PromptModal
                        title='Warning!'
                        bodyText={track.warningContent}
                        confirmColor={ButtonType.Caution}
                        onConfirm={()=> {
                            selectAndSetTrack(track.key);
                        }}
                        dontShowAgainSettingName='mainSettings.disableExperimentalWarning'
                    />);
            } else {
                selectAndSetTrack(track.key);
            }
        }
    };

    const handleInstall = async () => {
        if (settings.has("mainSettings.installPath")) {
            await InstallManager.installAddon(selectedAddon, publisherData, showModalAsync);
        } else {
            await setupInstallPath();
        }
    };

    const handleCancel = useCallback(() => {
        if (isInstalling && !isFinishingDependencyInstall) {
            InstallManager.cancelDownload(selectedAddon);
        }
    }, [selectedAddon, isInstalling]);

    const UninstallButton = (): JSX.Element => {
        switch (status) {
            case InstallStatus.UpToDate:
            case InstallStatus.NeedsUpdate:
            case InstallStatus.TrackSwitch:
            case InstallStatus.DownloadDone:
            case InstallStatus.GitInstall: {
                return (
                    <SidebarButton
                        type={ButtonType.Neutral}
                        onClick={() => InstallManager.uninstallAddon(selectedAddon, publisherData, showModalAsync)}
                    >
                        Uninstall
                    </SidebarButton>
                );
            }
            default: return <></>;
        }
    };

    if (!publisherData) {
        return null;
    }

    if (publisherData.addons.length === 0) {
        return <NoAvailableAddonsSection/>;
    }

    return (
        <div className="flex flex-row w-full h-full">
            <div
                className="flex-none bg-navy-medium z-40 h-full"
                style={{ width: "29rem" }}
            >
                <div className="h-full flex flex-col divide-y divide-gray-700">
                    <AddonBar>
                        <div className="flex flex-col gap-y-4">
                            {publisherData.addons.filter((it) => !it.category).map((addon) => (
                                <AddonBarItem
                                    selected={selectedAddon.key === addon.key && addon.enabled}
                                    enabled={addon.enabled || !!addon.hidesAddon}
                                    addon={addon}
                                    key={addon.key}
                                    onClick={() => {
                                        history.push(`/addon-section/${publisherData.name}/`);

                                        setSelectedAddon(addon);
                                    }}
                                />
                            ))}
                        </div>

                        <div className="h-full flex flex-col gap-y-4">
                            {publisherData.defs?.filter((it) => it.kind === 'addonCategory').map((category: AddonCategoryDefinition) => {
                                const categoryAddons = publisherData.addons.filter((it) => it.category?.substring(1) === category.key);

                                if (categoryAddons.length === 0) {
                                    return null;
                                }

                                let classes = '';
                                if (category.styles?.includes('align-bottom')) {
                                    classes += 'mt-auto';
                                }

                                return (
                                    <div className={classes}>
                                        <h4 className="text-quasi-white font-manrope font-medium">{category.title}</h4>

                                        <div className="flex flex-col gap-y-4">
                                            {publisherData.addons.filter((it) => it.category?.substring(1) === category.key).map((addon) => (
                                                <AddonBarItem
                                                    selected={selectedAddon.key === addon.key && addon.enabled}
                                                    enabled={addon.enabled || !!addon.hidesAddon}
                                                    addon={addon}
                                                    key={addon.key}
                                                    onClick={() => {
                                                        history.push(`/addon-section/${publisherData.name}/`);

                                                        setSelectedAddon(addon);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AddonBar>
                </div>
            </div>
            <div
                className={`bg-navy w-full flex flex-col h-full`}
            >
                <div className="flex flex-row h-full relative">
                    <div className="w-full">
                        <Route path={`/addon-section/FlyByWire Simulations/configuration/fbw-local-api-config`}>
                            <LocalApiConfigEditUI />
                        </Route>

                        <Route exact path={`/addon-section/${publisherName}`}>
                            {publisherData.addons.every(addon => !addon.enabled) ?
                                <Redirect to={`/addon-section/${publisherName}/no-available-addons`} /> :
                                <Redirect to={`/addon-section/${publisherName}/main/configure`} />
                            }
                        </Route>

                        <Route path={`/addon-section/${publisherName}/no-available-addons`}>
                            <NoAvailableAddonsSection />
                        </Route>

                        <Route path={`/addon-section/${publisherName}/main`}>
                            <div className="h-full flex flex-col">
                                <div
                                    className="flex-shrink-0 relative bg-cover bg-center"
                                    style={{
                                        height: '44vh',
                                        backgroundImage: (selectedAddon.backgroundImageShadow ?? true)
                                            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url(${selectedAddon.backgroundImageUrls[0]})`
                                            : `url(${selectedAddon.backgroundImageUrls[0]})`,
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 flex flex-row items-end gap-x-1 w-full bg-navy">
                                        <StateSection publisher={publisherData} addon={selectedAddon} />
                                    </div>
                                </div>
                                <div className="h-0 flex-grow flex flex-row">
                                    <Route exact path={`/addon-section/${publisherName}/main/configure`}>
                                        <Redirect to={`/addon-section/${publisherName}/main/configure/release-track`} />
                                    </Route>

                                    <Route path={`/addon-section/:publisher/main/configure/:aspectKey`} render={({ match: { params: { aspectKey } } }) => (
                                        <Configure
                                            routeAspectKey={aspectKey}
                                            selectedAddon={selectedAddon}
                                            selectedTrack={selectedTrack}
                                            installedTrack={installedTrack}
                                            onTrackSelection={handleTrackSelection}
                                        />
                                    )} />

                                    <Route path={`/addon-section/${publisherName}/main/release-notes`}>
                                        {releaseNotes && releaseNotes.length > 0 ? (
                                            <ReleaseNotes addon={selectedAddon}/>
                                        ) :
                                            <Redirect to={`/addon-section/${publisherName}/main/configure`}/>
                                        }
                                    </Route>

                                    <Route path={`/addon-section/${publisherName}/main/simbridge-config`}>
                                        <LocalApiConfigEditUI />
                                    </Route>

                                    <Route path={`/addon-section/${publisherName}/main/about`}>
                                        <About addon={selectedAddon} />
                                    </Route>

                                    <div className="flex flex-col items-center ml-auto justify-between h-full relative bg-navy-dark p-7 flex-shrink-0">
                                        <div className="w-full flex flex-col items-start place-self-start space-y-7">
                                            <SideBarLink to={`/addon-section/${publisherName}/main/configure`}>
                                                <Sliders size={22} />
                                                Configure
                                            </SideBarLink>
                                            {releaseNotes && releaseNotes.length > 0 && (
                                                <SideBarLink to={`/addon-section/${publisherName}/main/release-notes`}>
                                                    <JournalText size={22} />
                                                    Release Notes
                                                </SideBarLink>
                                            )}
                                            {selectedAddon.key === 'simbridge' && ( // TODO find a better way to do this...
                                                <SideBarLink to={`/addon-section/${publisherName}/main/simbridge-config`} disabled={InstallStatusCategories.installing.includes(status)}>
                                                    <Gear size={22} />
                                                    Settings
                                                </SideBarLink>
                                            )}
                                            <SideBarLink to={`/addon-section/${publisherName}/main/about`}>
                                                <InfoCircle size={22} />
                                                About
                                            </SideBarLink>
                                        </div>

                                        <div className="flex flex-col gap-y-4">
                                            <UninstallButton />
                                            {installStates[selectedAddon.key] && (
                                                <MainActionButton
                                                    installState={installStates[selectedAddon.key]}
                                                    onInstall={handleInstall}
                                                    onCancel={handleCancel}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Route>
                    </div>
                </div>
            </div>
        </div>
    );
};

const About: FC<{ addon: Addon }> = ({ addon }) => (
    <div className="w-full h-full p-7">
        <div className="flex justify-between items-center">
            <h2 className="text-white font-bold">About</h2>

            <h2 className="text-white">{addon.aircraftName}</h2>
        </div>
        <ReactMarkdown
            className="text-xl text-white font-light font-manrope leading-relaxed"
            children={addon.description}
            linkTarget={"_blank"}
        />

        {addon.techSpecs && addon.techSpecs.length > 0 && (
            <>
                <h3 className="text-white font-bold">Tech Specs</h3>

                <div className="flex flex-row gap-x-16">
                    {addon.techSpecs.map((spec) => (
                        <span className="flex flex-col items-start">
                            <span className="text-2xl text-quasi-white mb-1">{spec.name}</span>
                            <span className="text-4xl font-manrope font-semibold text-cyan">{spec.value}</span>
                        </span>
                    ))}
                </div>
            </>
        )}

        <MyInstall addon={addon} />
    </div>
);
