import React, { FC, useEffect, useState } from "react";
import fs from "fs-extra";
import * as path from "path";
import { fetchLatestVersionNames } from "renderer/components/App";
import { setupInstallPath } from "renderer/actions/install-path.utils";
import { DownloadItem } from "renderer/redux/types";
import { useSelector } from "react-redux";
import { Track, Tracks } from "renderer/components/AircraftSection/TrackSelector";
import { FragmenterInstaller, needsUpdate, getCurrentInstall } from "@flybywiresim/fragmenter";
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
import { callWarningModal } from "renderer/redux/features/warningModal";
import { setInstallStatus } from "renderer/redux/features/installStatus";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";
import { HiddenAddonCover } from "renderer/components/AircraftSection/HiddenAddonCover/HiddenAddonCover";

import "./index.css";

let abortController: AbortController;

export enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    FreshInstall,
    GitInstall,
    TrackSwitch,
    DownloadPrep,
    Downloading,
    Decompressing,
    DownloadEnding,
    DownloadDone,
    DownloadRetry,
    DownloadError,
    DownloadCanceled,
    Unknown,
    Hidden,
}

enum MsfsStatus {
    Open,
    Closed,
    Checking,
}

interface InstallButtonProps {
    className?: string;
    onClick?: () => void;
}

const InstallButton: FC<InstallButtonProps> = ({
    children,
    className,
    onClick,
}) => (
    <div
        className={`w-64 h-16 text-white font-bold text-2xl rounded-md p-4 flex-shrink-0 flex flex-row items-center justify-center cursor-pointer transition duration-200 ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
);

const StateText: FC = ({ children }) => (
    <div className="text-white text-2xl font-bold">{children}</div>
);

interface SideBarLinkProps {
    to: string;
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children }) => (
    <NavLink
        className="flex flex-row items-center gap-x-5 justify-center text-2xl text-white hover:text-cyan"
        activeClassName="text-cyan"
        to={to}
    >
        {children}
    </NavLink>
);

export interface AircraftSectionURLParams {
    publisherName: string;
}

export const AircraftSection = () => {
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
    const selectedTracks = useAppSelector(state => state.selectedTrack);
    const installStatus = useAppSelector(state => state.installStatus);

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
    }, [selectedAddon]);

    useEffect(() => {
        const firstAvailableAddon = publisherData.addons.find((addon) => addon.enabled);

        if (!firstAvailableAddon) {
            history.push(`/aircraft-section/${publisherName}/no-available-addons`);
            return;
        }

        fetchLatestVersionNames(firstAvailableAddon).then(() => {
            setSelectedAddon(firstAvailableAddon);
        });
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

    const [msfsIsOpen, setMsfsIsOpen] = useState<MsfsStatus>(MsfsStatus.Checking);

    const download: DownloadItem = useSelector((state: InstallerStore) =>
        state.downloads.find(download => download.id === selectedAddon.name)
    );

    const isDownloading = download?.progress >= 0;

    useEffect(() => {
        const checkMsfsInterval = setInterval(async () => {
            setMsfsIsOpen(
                (await Msfs.isRunning()) ? MsfsStatus.Open : MsfsStatus.Closed
            );
        }, 500);

        return () => clearInterval(checkMsfsInterval);
    }, []);

    useEffect(() => {
        findInstalledTrack();
        if (!isDownloading && getCurrentInstallStatus() !== InstallStatus.DownloadPrep) {
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
            return InstallStatus.FreshInstall;
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
                return InstallStatus.FreshInstall;
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
        const installDir = Directories.inCommunity(selectedAddon.targetDirectory);
        const tempDir = Directories.temp();

        console.log("Installing", track);
        console.log("Installing into", installDir, "using temp dir", tempDir);

        // Prepare temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
        }
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

        // Initialize abort controller for downloads
        abortController = new AbortController();
        const signal = abortController.signal;

        try {
            let lastPercent = 0;
            setCurrentInstallStatus(InstallStatus.Downloading);
            dispatch(registerNewDownload({ id: selectedAddon.key, module: "" }));

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
                            progress: progress.percent
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
        Directories.removeAllTemp();
    };

    const selectAndSetTrack = (key: string) => {
        const newTrack = selectedAddon.tracks.find((track) => track.key === key);
        setCurrentlySelectedTrack(newTrack);
    };

    const handleTrackSelection = (track: AddonTrack) => {
        if (!isDownloading && getCurrentInstallStatus() !== InstallStatus.DownloadPrep && track.isExperimental) {
            dispatch(
                callWarningModal({
                    showWarningModal: track.isExperimental,
                    track: track,
                    selectedAddon: selectedAddon,
                }));
        } else {
            selectAndSetTrack(track.key);
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
            abortController.abort();
            dispatch(deleteDownload({ id: selectedAddon.key }));
        }
    };

    const notifyDownload = (successful: boolean) => {
        console.log("Requesting notification");
        Notification.requestPermission()
            .then(() => {
                console.log("Showing notification");
                if (successful) {
                    new Notification("Download complete!", {
                        icon: path.join(
                            process.resourcesPath,
                            "extraResources",
                            "icon.ico"
                        ),
                        body: "You're ready to fly",
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

    const ActiveState = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <StateText>
                    {msfsIsOpen === MsfsStatus.Open
                        ? "Please close MSFS"
                        : "Checking status..."}
                </StateText>
            );
        }

        switch (getCurrentInstallStatus()) {
            case InstallStatus.UpToDate:
                return <></>;
            case InstallStatus.NeedsUpdate:
                return <StateText>New release available</StateText>;
            case InstallStatus.FreshInstall:
                return <></>;
            case InstallStatus.GitInstall:
                return <></>;
            case InstallStatus.TrackSwitch:
                return <></>;
            case InstallStatus.DownloadPrep:
                return <StateText>Preparing update</StateText>;
            case InstallStatus.Downloading:
                return <StateText>{`Downloading ${download?.module.toLowerCase()} module`}</StateText>;
            case InstallStatus.Decompressing:
                return <StateText>Decompressing</StateText>;
            case InstallStatus.DownloadEnding:
                return <StateText>Finishing update</StateText>;
            case InstallStatus.DownloadDone:
                return <StateText>Completed!</StateText>;
            case InstallStatus.DownloadRetry:
                return <StateText>Retrying {download?.module.toLowerCase()} module</StateText>;
            case InstallStatus.DownloadError:
                return <StateText>Failed to install</StateText>;
            case InstallStatus.DownloadCanceled:
                return <StateText>Download canceled</StateText>;
            case InstallStatus.Unknown:
                return <StateText>Unknown state</StateText>;
            default: return <></>;
        }
    };

    const ActiveInstallButton = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <InstallButton className="bg-gray-700 text-grey-medium pointer-events-none">
                    Unavailable
                </InstallButton>
            );
        }

        switch (getCurrentInstallStatus()) {
            case InstallStatus.UpToDate:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed
                    </InstallButton>
                );
            case InstallStatus.NeedsUpdate:
                return (
                    <InstallButton
                        className="bg-yellow-500 hover:bg-yellow-400"
                        onClick={handleInstall}
                    >
                        Update
                    </InstallButton>
                );
            case InstallStatus.FreshInstall:
                return (
                    <InstallButton
                        className="bg-green-500"
                        onClick={handleInstall}
                    >
                        Install
                    </InstallButton>
                );
            case InstallStatus.GitInstall:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed (git)
                    </InstallButton>
                );
            case InstallStatus.TrackSwitch:
                return (
                    <InstallButton
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleInstall}
                    >
                        Switch Version
                    </InstallButton>
                );
            case InstallStatus.DownloadPrep:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.Downloading:
                return (
                    <InstallButton
                        className="bg-red-600 hover:bg-red-500"
                        onClick={handleCancel}
                    >
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.Decompressing:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.DownloadEnding:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Cancel
                    </InstallButton>
                );
            case InstallStatus.DownloadDone:
                return (
                    <InstallButton className="pointer-events-none bg-green-500">
                        Installed
                    </InstallButton>
                );
            case InstallStatus.DownloadRetry:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.DownloadError:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.DownloadCanceled:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
                );
            case InstallStatus.Unknown:
                return (
                    <InstallButton className="bg-gray-700 text-grey-medium cursor-not-allowed">
                        Error
                    </InstallButton>
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
                className="flex-none bg-navy-medium z-40 shadow-2xl h-full"
                style={{ width: "28rem" }}
            >
                <div className="h-full flex flex-col divide-y divide-gray-700">
                    <AddonBar>
                        {publisherData.addons.filter((it) => !it.category).map((addon) => (
                            <AddonBarItem
                                selected={selectedAddon.key === addon.key && addon.enabled}
                                enabled={addon.enabled || !!addon.hidesAddon}
                                className="h-32"
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
                                    <span className="text-3xl font-manrope font-bold">{category.title}</span>

                                    {publisherData.addons.filter((it) => it.category?.substring(1) === category.key).map((addon) => (
                                        <AddonBarItem
                                            selected={selectedAddon.key === addon.key && addon.enabled}
                                            enabled={addon.enabled || !!addon.hidesAddon}
                                            className="h-32"
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
                className={`bg-navy-light w-full flex flex-col h-full`}
            >
                <div className="flex flex-row h-full relative">
                    <div className="w-full">

                        <Route exact path={`/aircraft-section/${publisherName}`}>
                            <Redirect to={`/aircraft-section/${publisherName}/main/configure`} />
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
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url(${selectedAddon.backgroundImageUrls[0]})`,
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full">
                                        <div>
                                            <ActiveState />
                                            {/* TODO: Actually calculate this value */}
                                            {/*{getCurrentInstallStatus() === InstallStatus.Downloading && (*/}
                                            {/*    <div className="text-white text-2xl">98.7 mb/s</div>*/}
                                            {/*)}*/}
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
                                    {getCurrentInstallStatus() === InstallStatus.Downloading && (
                                        <div
                                            className="absolute -bottom-1 w-full h-2 z-10 bg-cyan progress-bar-animated"
                                            style={{ width: `${download?.progress}%` }}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-row h-1/2">

                                    <Route path={`/aircraft-section/${publisherName}/main/configure`}>
                                        <div className="p-7 overflow-y-scroll">
                                            <h2 className="text-white font-extrabold">
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
                                                    <h5 className="text-xl text-quasi-white ml-0.5 mt-3">
                                                        Mainline Releases
                                                    </h5>
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
                                                        <h5 className="text-xl text-quasi-white ml-0.5 mt-3">
                                                            Experimental versions
                                                        </h5>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedTrack() && selectedTrack().description &&
                                            <div className="mt-10">
                                                <h2 className="text-white font-extrabold">Description</h2>
                                                <p className="text-xl text-white font-manrope leading-relaxed">
                                                    {selectedTrack().description}
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

                                    <div className="flex flex-col items-center ml-auto justify-between h-full relative bg-navy p-7 flex-shrink-0">
                                        <div className="flex flex-col items-start place-self-start space-y-7">
                                            <SideBarLink to={`/aircraft-section/${publisherName}/main/configure`}>
                                                <Sliders size={24} />
                                                Configure
                                            </SideBarLink>
                                            {releaseNotes && releaseNotes.length > 0 && (
                                                <SideBarLink to={`/aircraft-section/${publisherName}/main/release-notes`}>
                                                    <JournalText size={24} />
                                                    Release Notes
                                                </SideBarLink>
                                            )}
                                            {/* <SideBarLink to="/aircraft-section/main/liveries">
                                                <Palette size={24} />
                                                Liveries
                                            </SideBarLink> */}
                                            <SideBarLink to={`/aircraft-section/${publisherName}/main/about`}>
                                                <InfoCircle size={24} />
                                                About
                                            </SideBarLink>
                                        </div>

                                        <ActiveInstallButton />
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
    <div className="h-full p-7 overflow-y-scroll">
        <h2 className="text-white font-extrabold">About</h2>
        <p className="text-xl text-white font-manrope leading-relaxed">
            {addon.description}
        </p>

        {addon.techSpecs && addon.techSpecs.length > 0 && (
            <>
                <h2 className="text-white font-extrabold">Tech Specs</h2>

                <div className="flex flex-row gap-x-16">
                    {addon.techSpecs.map((spec) => (
                        <span className="flex flex-col items-start">
                            <span className="text-2xl text-quasi-white">{spec.name}</span>
                            <span className="text-3xl font-manrope font-semibold text-cyan">{spec.value}</span>
                        </span>
                    ))}
                </div>
            </>
        )}
    </div>
);
