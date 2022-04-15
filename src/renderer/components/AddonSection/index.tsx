import React, { FC, useEffect, useState } from "react";
import fs from "fs-extra";
import * as path from "path";
import { setupInstallPath } from "renderer/actions/install-path.utils";
import { DownloadItem } from "renderer/redux/types";
import { useSelector } from "react-redux";
import { Track, Tracks } from "renderer/components/AddonSection/TrackSelector";
import { FragmenterInstaller, getCurrentInstall, needsUpdate } from "@flybywiresim/fragmenter";
import { InstallerStore, useAppDispatch, useAppSelector } from "../../redux/store";
import { Addon, AddonTrack } from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { Msfs } from "renderer/utils/Msfs";
import { NavLink, Redirect, Route, useHistory, useParams } from "react-router-dom";
import { InfoCircle, JournalText, Sliders } from "react-bootstrap-icons";
import settings, { useSetting } from "common/settings";
import { ipcRenderer } from "electron";
import { AddonBar, AddonBarItem } from "../App/AddonBar";
import { NoAvailableAddonsSection } from "../NoAvailableAddonsSection";
import { ReleaseNotes } from "./ReleaseNotes";
import { setInstalledTrack } from 'renderer/redux/features/installedTrack';
import { deleteDownload, registerNewDownload, updateDownloadProgress } from 'renderer/redux/features/downloads';
import { setInstallStatus } from "renderer/redux/features/installStatus";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { HiddenAddonCover } from "renderer/components/AddonSection/HiddenAddonCover/HiddenAddonCover";
import { PromptModal, useModals } from "renderer/components/Modal";
import ReactMarkdown from "react-markdown";
import { Button, ButtonType } from "renderer/components/Button";
import { MainActionButton } from "renderer/components/AddonSection/MainActionButton";
import { ApplicationStatus, InstallStatus } from "renderer/components/AddonSection/Enums";
import { ActiveStateText } from "renderer/components/AddonSection/ActiveStateText";
import { LocalApiServer } from "renderer/utils/LocalApiServer";
import { setApplicationStatus } from "renderer/redux/features/applicationStatus";

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
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children }) => (
    <NavLink
        className="w-full flex flex-row items-center gap-x-5 text-2xl text-white font-manrope font-bold hover:text-cyan no-underline"
        activeClassName="text-cyan"
        to={to}
    >
        {children}
    </NavLink>
);

export interface AircraftSectionURLParams {
    publisherName: string;
}

export const AircraftSection = (): JSX.Element => {
    const { publisherName } = useParams<AircraftSectionURLParams>();

    const publisherData = useAppSelector(state => state.configuration.publishers.find(pub => pub.name === publisherName));
    const history = useHistory();
    const dispatch = useAppDispatch();

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
    const installStatus = useAppSelector(state => state.installStatus);
    const applicationStatus = useAppSelector(state => state.applicationStatus);

    const releaseNotes = useAppSelector(state => state.releaseNotes[selectedAddon.key]);

    useEffect(() => {
        const hiddenAddon = publisherData.addons.find((addon) => addon.key === selectedAddon.hidesAddon);

        if (hiddenAddon) {
            setHiddenAddon(hiddenAddon);
            history.push(`/aircraft-section/${publisherName}/hidden-addon-cover`);
        } else {
            setHiddenAddon(undefined);
            history.push(`/aircraft-section/${publisherName}/main/configure`);
        }

        settings.set('cache.main.lastShownAddonKey', selectedAddon.key);
    }, [selectedAddon]);

    useEffect(() => {
        const firstAvailableAddon = publisherData.addons.find((addon) => addon.enabled);

        if (!firstAvailableAddon) {
            history.push(`/aircraft-section/${publisherName}/no-available-addons`);
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
                Directories.inCommunity(selectedAddon.targetDirectory)
            );
            console.log("Currently installed", manifest);

            let track = selectedAddon.tracks.find(track => track.url.includes(manifest.source));

            if (!track) {
                track = selectedAddon.tracks.find(track => track.alternativeUrls.includes(manifest.source));
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

    const getCurrentInstallStatus = (): InstallStatus => {
        try {
            return installStatus[selectedAddon.key] as InstallStatus;
        } catch (e) {
            setCurrentInstallStatus(InstallStatus.Unknown);
            return InstallStatus.Unknown;
        }
    };

    const setCurrentInstallStatus = (new_state: InstallStatus) => {
        dispatch(setInstallStatus({ addonKey: selectedAddon.key, installStatus: new_state }));
    };

    const download: DownloadItem = useSelector((state: InstallerStore) =>
        state.downloads.find(download => download.id === selectedAddon.name)
    );

    const isDownloading = download?.progress >= 0;
    const isInstalling = getCurrentInstallStatus() === InstallStatus.Downloading || getCurrentInstallStatus() === InstallStatus.DownloadPrep || getCurrentInstallStatus() === InstallStatus.Decompressing || getCurrentInstallStatus() === InstallStatus.DownloadEnding || getCurrentInstallStatus() === InstallStatus.DownloadRetry;

    const lowestAvailableAbortControllerID: number = useSelector((state: InstallerStore) => {
        for (let i = 0; i < abortControllers.length; i++) {
            if (!state.downloads.map(download => download.abortControllerID).includes(i)) {
                return i;
            }
        }
    });

    useEffect(() => {
        const checkApplicationInterval = setInterval(async () => {
            dispatch(setApplicationStatus({ applicationName: 'msfs', applicationStatus: (await Msfs.isRunning()) ? ApplicationStatus.Open : ApplicationStatus.Closed }));
            dispatch(setApplicationStatus({ applicationName: 'localApi', applicationStatus: (await LocalApiServer.isRunning()) ? ApplicationStatus.Open : ApplicationStatus.Closed }));
        }, 500);

        return () => clearInterval(checkApplicationInterval);
    }, []);

    useEffect(() => {
        findInstalledTrack();
        if (!isInstalling) {
            getInstallStatus().then(setCurrentInstallStatus);
        }
    }, [selectedTrack(), installedTrack()]);

    useEffect(() => {
        if (download && isDownloading) {
            ipcRenderer.send("set-window-progress-bar", download.progress / 100);
        } else {
            ipcRenderer.send("set-window-progress-bar", -1);
        }
    }, [download]);

    const [addonDiscovered] = useSetting<boolean>(
        "cache.main.discoveredAddons." + hiddenAddon?.key
    );

    useEffect(() => {
        if (addonDiscovered) {
            setSelectedAddon(hiddenAddon);
        }
    }, [addonDiscovered]);

    const getInstallStatus = async (): Promise<InstallStatus> => {
        if (selectedAddon.hidden && !addonDiscovered) {
            return InstallStatus.Hidden;
        }
        if (!selectedTrack()) {
            return InstallStatus.Unknown;
        }

        console.log("Checking install status");

        const installDir = Directories.inCommunity(selectedAddon.targetDirectory);

        if (!fs.existsSync(installDir)) {
            return InstallStatus.NotInstalled;
        }

        console.log("Checking for git install");
        if (Directories.isGitInstall(installDir)) {
            return InstallStatus.GitInstall;
        }

        try {
            const updateInfo = await needsUpdate(selectedTrack().url, installDir, {
                forceCacheBust: true,
            });
            console.log("Update info", updateInfo);

            if (selectedTrack() !== installedTrack() && installedTrack()) {
                return InstallStatus.TrackSwitch;
            }
            if (updateInfo.isFreshInstall) {
                return InstallStatus.NotInstalled;
            }

            if (updateInfo.needsUpdate) {
                return InstallStatus.NeedsUpdate;
            }

            return InstallStatus.UpToDate;
        } catch (e) {
            console.error(e);
            return InstallStatus.Unknown;
        }
    };

    console.log(selectedTrack());

    const downloadAddon = async (track: AddonTrack) => {
        // Initialize abort controller for downloads
        const abortControllerID = lowestAvailableAbortControllerID;

        abortControllers[abortControllerID] = new AbortController;
        const signal = abortControllers[abortControllerID].signal;

        dispatch(registerNewDownload({ id: selectedAddon.key, module: "", abortControllerID: abortControllerID }));

        const installDir = Directories.inCommunity(selectedAddon.targetDirectory);
        const tempDir = Directories.temp();

        console.log("Installing", track);
        console.log("Installing into", installDir, "using temp dir", tempDir);

        // Prepare temporary directory
        fs.removeSync(tempDir);
        fs.mkdirSync(tempDir);

        // Copy current install to temporary directory
        console.log("Checking for existing install");
        if (Directories.isFragmenterInstall(installDir)) {
            setCurrentInstallStatus(InstallStatus.DownloadPrep);
            console.log("Found existing install at", installDir);
            console.log("Copying existing install to", tempDir);
            await fs.copy(installDir, tempDir);
            console.log("Finished copying");
        }

        try {
            let lastPercent = 0;
            setCurrentInstallStatus(InstallStatus.Downloading);

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on("downloadStarted", (module) => {
                console.log("Downloading started for module", module.name);
                setCurrentInstallStatus(InstallStatus.Downloading);
            });
            installer.on("downloadProgress", (module, progress) => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    dispatch(
                        updateDownloadProgress({
                            id: selectedAddon.key,
                            module: module.name,
                            progress: progress.percent,
                        }));
                }
            });
            installer.on("unzipStarted", (module) => {
                console.log("Started unzipping module", module.name);
                setCurrentInstallStatus(InstallStatus.Decompressing);
            });
            installer.on("retryScheduled", (module, retryCount, waitSeconds) => {
                console.log("Scheduling a retry for module", module.name);
                console.log("Retry count", retryCount);
                console.log("Waiting for", waitSeconds, "seconds");

                setCurrentInstallStatus(InstallStatus.DownloadRetry);
            });
            installer.on("retryStarted", (module, retryCount) => {
                console.log("Starting a retry for module", module.name);
                console.log("Retry count", retryCount);

                setCurrentInstallStatus(InstallStatus.Downloading);
            });

            console.log("Starting fragmenter download for URL", track.url);
            const installResult = await installer.install(signal, {
                forceCacheBust: !(settings.get("mainSettings.useCdnCache") as boolean),
                forceFreshInstall: false,
                forceManifestCacheBust: true,
            });
            console.log("Fragmenter download finished for URL", track.url);

            // Copy files from temp dir
            setCurrentInstallStatus(InstallStatus.DownloadEnding);
            Directories.removeTargetForAddon(selectedAddon);
            console.log("Copying files from", tempDir, "to", installDir);
            await fs.copy(tempDir, installDir, { recursive: true });
            console.log("Finished copying files from", tempDir, "to", installDir);

            // Remove installs existing under alternative names
            console.log("Removing installs existing under alternative names");
            Directories.removeAlternativesForAddon(selectedAddon);
            console.log(
                "Finished removing installs existing under alternative names"
            );

            dispatch(deleteDownload({ id: selectedAddon.key }));
            notifyDownload(true);

            // Flash completion text
            setCurrentlyInstalledTrack(track);
            setCurrentInstallStatus(InstallStatus.DownloadDone);

            console.log("Finished download", installResult);
        } catch (e) {
            if (signal.aborted) {
                setCurrentInstallStatus(InstallStatus.DownloadCanceled);
            } else {
                console.error(e);
                setCurrentInstallStatus(InstallStatus.DownloadError);
                notifyDownload(false);
            }
            setTimeout(async () => setCurrentInstallStatus(await getInstallStatus()), 3_000);
        }

        dispatch(deleteDownload({ id: selectedAddon.key }));

        // Clean up temp dir
        fs.removeSync(tempDir);
    };

    const { showModal } = useModals();

    const uninstallAddon = async () => {
        showModal(
            <PromptModal
                title='Are you sure?'
                bodyText={`You are about to uninstall the addon ${selectedAddon.name}. You cannot undo this, except by reinstalling.`}
                confirmColor={ButtonType.Danger}
                onConfirm={async () => {
                    const installDir = Directories.inCommunity(selectedAddon.targetDirectory);
                    console.log('uninstalling ', installedTrack);

                    if (fs.existsSync(installDir)) {
                        fs.removeSync(installDir);
                    }
                    if (fs.existsSync(Directories.inPackagesMicrosoftStore(selectedAddon.targetDirectory))) {
                        await fs.promises.readdir(Directories.inPackagesMicrosoftStore(selectedAddon.targetDirectory))
                            .then((f) => Promise.all(f.map(e => {
                                if (e !== 'work') {
                                    fs.promises.unlink(path.join(Directories.inPackagesMicrosoftStore(selectedAddon.targetDirectory), e));
                                }
                            })));
                    }
                    if (fs.existsSync(Directories.inPackagesSteam(selectedAddon.targetDirectory))) {
                        await fs.promises.readdir(Directories.inPackagesSteam(selectedAddon.targetDirectory))
                            .then((f) => Promise.all(f.map(e => {
                                if (e !== 'work') {
                                    fs.promises.unlink(path.join(Directories.inPackagesSteam(selectedAddon.targetDirectory), e));
                                }
                            })));
                    }
                    setCurrentInstallStatus(InstallStatus.NotInstalled);
                    setCurrentlyInstalledTrack(null);
                }}/>
        );
    };

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

    const handleInstall = () => {
        if (settings.has("mainSettings.msfsPackagePath")) {
            downloadAddon(selectedTrack()).then(() =>
                console.log("Download and install complete")
            );
        } else {
            setupInstallPath().then();
        }
    };

    const handleCancel = () => {
        if (isDownloading) {
            console.log("Cancel download");
            abortControllers[download.abortControllerID].abort();
            dispatch(deleteDownload({ id: selectedAddon.key }));
        }
    };

    const notifyDownload = (successful: boolean) => {
        console.log("Requesting notification");
        Notification.requestPermission()
            .then(() => {
                console.log("Showing notification");
                if (successful) {
                    new Notification(`${selectedAddon.name} download complete!`, {
                        icon: path.join(
                            process.resourcesPath,
                            "extraResources",
                            "icon.ico"
                        ),
                        body: "Take to the skies!",
                    });
                } else {
                    new Notification("Download failed!", {
                        icon: path.join(
                            process.resourcesPath,
                            "extraResources",
                            "icon.ico"
                        ),
                        body: "Oops, something went wrong",
                    });
                }
            })
            .catch((e) => console.log(e));
    };

    const UninstallButton = (): JSX.Element => {
        switch (getCurrentInstallStatus()) {
            case InstallStatus.UpToDate:
            case InstallStatus.NeedsUpdate:
            case InstallStatus.TrackSwitch:
            case InstallStatus.DownloadDone:
            case InstallStatus.GitInstall:
                if (applicationStatus.msfs !== ApplicationStatus.Closed || applicationStatus.localApi !== ApplicationStatus.Closed) {
                    return <></>;
                }
                return (
                    <SidebarButton
                        type={ButtonType.Neutral}
                        onClick={uninstallAddon}
                    >
                        Uninstall
                    </SidebarButton>
                );
            default: return <></>;
        }
    };

    if (!publisherData) {
        return null;
    }

    return (
        <div className="flex flex-row w-full h-full">
            <div
                className="flex-none bg-navy-medium z-40 h-full"
                style={{ width: "31rem" }}
            >
                <div className="h-full flex flex-col divide-y divide-gray-700">
                    <AddonBar>
                        {publisherData.addons.filter((it) => !it.category).map((addon) => (
                            <AddonBarItem
                                selected={selectedAddon.key === addon.key && addon.enabled}
                                enabled={addon.enabled || !!addon.hidesAddon}
                                addon={addon}
                                key={addon.key}
                                onClick={() => setSelectedAddon(addon)}
                            />
                        ))}

                        {publisherData.defs?.filter((it) => it.kind === 'addonCategory').map((category) => {
                            const categoryAddons = publisherData.addons.filter((it) => it.category?.substring(1) === category.key);

                            if (categoryAddons.length === 0) {
                                return null;
                            }

                            return (
                                <>
                                    <span className="text-3xl font-manrope font-medium">{category.title}</span>

                                    {publisherData.addons.filter((it) => it.category?.substring(1) === category.key).map((addon) => (
                                        <AddonBarItem
                                            selected={selectedAddon.key === addon.key && addon.enabled}
                                            enabled={addon.enabled || !!addon.hidesAddon}
                                            addon={addon}
                                            key={addon.key}
                                            onClick={() => setSelectedAddon(addon)}
                                        />
                                    ))}
                                </>
                            );
                        })}
                    </AddonBar>
                </div>
            </div>
            <div
                className={`bg-navy w-full flex flex-col h-full`}
            >
                <div className="flex flex-row h-full relative">
                    <div className="w-full">

                        <Route exact path={`/aircraft-section/${publisherName}`}>
                            {publisherData.addons.every(addon => !addon.enabled) ?
                                <Redirect to={`/aircraft-section/${publisherName}/no-available-addons`} /> :
                                <Redirect to={`/aircraft-section/${publisherName}/main/configure`} />
                            }
                        </Route>

                        <Route path={`/aircraft-section/${publisherName}/no-available-addons`}>
                            <NoAvailableAddonsSection />
                        </Route>

                        <Route path={`/aircraft-section/${publisherName}/hidden-addon-cover`}>
                            {addonDiscovered ? (
                                <Redirect to={`/aircraft-section/${publisherName}/main/configure`} />
                            ) : (
                                hiddenAddon ? (
                                    <HiddenAddonCover addon={hiddenAddon} />
                                ) : (
                                    <Redirect to={`/aircraft-section/${publisherName}/main/configure`} />
                                )
                            )}
                        </Route>

                        <Route path={`/aircraft-section/${publisherName}/main`}>
                            <div className="h-full">
                                <div
                                    className="h-1/2 relative bg-cover bg-center"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url(${selectedAddon.backgroundImageUrls[0]})`,
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full">
                                        <div>
                                            <ActiveStateText
                                                installStatus={installStatus[selectedAddon.key]}
                                                download={download}
                                            />
                                        </div>
                                        {getCurrentInstallStatus() === InstallStatus.Downloading && (
                                            // TODO: Replace this with a JIT value
                                            <div
                                                className="text-white font-semibold"
                                                style={{ fontSize: "38px" }}
                                            >
                                                {download?.progress}%
                                            </div>
                                        )}
                                    </div>
                                    {isInstalling && (
                                        <div className="absolute -bottom-1 w-full h-2 z-10 bg-black">
                                            <div
                                                className="absolute h-2 z-11 bg-cyan progress-bar-animated"
                                                style={{ width: `${download?.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row h-1/2">

                                    <Route path={`/aircraft-section/${publisherName}/main/configure`}>
                                        <div className="p-7 overflow-y-scroll">
                                            <h2 className="text-white font-bold">
                                                Choose Your Version
                                            </h2>
                                            <div className="flex flex-row gap-x-8">
                                                <div>
                                                    <Tracks>
                                                        {selectedAddon.tracks
                                                            .filter((track) => !track.isExperimental)
                                                            .map((track) => (
                                                                <Track
                                                                    addon={selectedAddon}
                                                                    key={track.key}
                                                                    track={track}
                                                                    isSelected={selectedTrack() === track}
                                                                    isInstalled={installedTrack() === track}
                                                                    handleSelected={() => handleTrackSelection(track)}
                                                                />
                                                            ))}
                                                    </Tracks>
                                                    <span className="text-2xl text-quasi-white ml-0.5 mt-3 inline-block">
                                                        Mainline Releases
                                                    </span>
                                                </div>
                                                <div>
                                                    <Tracks>
                                                        {selectedAddon.tracks
                                                            .filter((track) => track.isExperimental)
                                                            .map((track) => (
                                                                <Track
                                                                    addon={selectedAddon}
                                                                    key={track.key}
                                                                    track={track}
                                                                    isSelected={selectedTrack() === track}
                                                                    isInstalled={installedTrack() === track}
                                                                    handleSelected={() => handleTrackSelection(track)}
                                                                />
                                                            ))}
                                                    </Tracks>

                                                    {selectedAddon.tracks.filter((track) => track.isExperimental).length > 0 && (
                                                        <span className="text-2xl text-quasi-white ml-0.5 mt-3 inline-block">
                                                            Experimental versions
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedTrack() && selectedTrack().description &&
                                            <div className="mt-10">
                                                <h2 className="text-white font-bold">Description</h2>
                                                <p className="text-xl text-white font-manrope leading-relaxed">
                                                    <ReactMarkdown
                                                        className="text-xl text-white font-light font-manrope leading-relaxed"
                                                        children={selectedTrack().description}
                                                        linkTarget={"_blank"}
                                                    />
                                                </p>
                                            </div>
                                            }
                                        </div>
                                    </Route>

                                    <Route path={`/aircraft-section/${publisherName}/main/release-notes`}>
                                        {releaseNotes && releaseNotes.length > 0 ? (
                                            <ReleaseNotes addon={selectedAddon}/>
                                        ) :
                                            <Redirect to={`/aircraft-section/${publisherName}/main/configure`}/>
                                        }
                                    </Route>

                                    <Route path={`/aircraft-section/${publisherName}/main/about`}>
                                        <About addon={selectedAddon}/>
                                    </Route>

                                    <div className="flex flex-col items-center ml-auto justify-between h-full relative bg-navy-dark p-7 flex-shrink-0">
                                        <div className="w-full flex flex-col items-start place-self-start space-y-7">
                                            <SideBarLink to={`/aircraft-section/${publisherName}/main/configure`}>
                                                <Sliders size={22} />
                                                Configure
                                            </SideBarLink>
                                            {releaseNotes && releaseNotes.length > 0 && (
                                                <SideBarLink to={`/aircraft-section/${publisherName}/main/release-notes`}>
                                                    <JournalText size={22} />
                                                    Release Notes
                                                </SideBarLink>
                                            )}
                                            {/* <SideBarLink to="/aircraft-section/main/liveries">
                                                <Palette size={24} />
                                                Liveries
                                            </SideBarLink> */}
                                            <SideBarLink to={`/aircraft-section/${publisherName}/main/about`}>
                                                <InfoCircle size={22} />
                                                About
                                            </SideBarLink>
                                        </div>

                                        <div className="flex flex-col gap-y-4">
                                            <UninstallButton />
                                            <MainActionButton
                                                installStatus={installStatus[selectedAddon.key]}
                                                onInstall={handleInstall}
                                                onCancel={handleCancel}
                                            />
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
    <div className="h-full p-7">
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
                <h2 className="text-white font-bold">Tech Specs</h2>

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
    </div>
);
