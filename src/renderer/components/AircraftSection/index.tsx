import React, { FC, useEffect, useState } from "react";
import { DialogContainer } from "./styles";
import fs from "fs-extra";
import * as path from "path";
import {
    fetchLatestVersionNames,
    getAddonReleases,
} from "renderer/components/App";
import { setupInstallPath } from "renderer/actions/install-path.utils";
import {
    DownloadItem,
    AddonAndTrackLatestVersionNamesState,
} from "renderer/redux/types";
import { connect, useDispatch, useSelector } from "react-redux";
import {
    deleteDownload,
    registerDownload,
    updateDownloadProgress,
} from "renderer/redux/actions/downloads.actions";
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import _ from "lodash";
import {
    Track,
    Tracks,
} from "renderer/components/AircraftSection/TrackSelector";
import {
    FragmenterInstaller,
    needsUpdate,
    getCurrentInstall,
} from "@flybywiresim/fragmenter";
import store, { InstallerStore } from "../../redux/store";
import * as actionTypes from "../../redux/actionTypes";
import {
    Addon,
    AddonTrack,
    AddonVersion,
    Publisher,
} from "renderer/utils/InstallerConfiguration";
import { Directories } from "renderer/utils/Directories";
import { Msfs } from "renderer/utils/Msfs";
import { LiveryConversionDialog } from "renderer/components/AircraftSection/LiveryConversion";
import { LiveryDefinition } from "renderer/utils/LiveryConversion";
import { NavLink, Redirect, Route, useHistory } from "react-router-dom";
import {
    CardText,
    InfoCircle,
    JournalText,
    Sliders,
} from "react-bootstrap-icons";
import "./index.css";
import settings, { useSetting } from "common/settings";
import { ipcRenderer } from "electron";
import FBWTail from "renderer/assets/FBW-Tail.svg";
import { PageSider } from "../App/styles";
import { AddonBar, AddonBarItem } from "../App/AddonBar";
import { NoAvailableAddonsSection } from "../NoAvailableAddonsSection";
import { GitVersions, ReleaseInfo } from "@flybywiresim/api-client";
import remarkGfm from "remark-gfm";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

// Props coming from renderer/components/App
type TransferredProps = {
    publisher: Publisher;
};

// Props coming from Redux' connect function
type ConnectedAircraftSectionProps = {
    selectedTracks: Record<string, AddonTrack>;
    installedTracks: Record<string, AddonTrack>;
    installStatus: Record<string, InstallStatus>;
    latestVersionNames: AddonAndTrackLatestVersionNamesState;
};

type AircraftSectionProps = TransferredProps & ConnectedAircraftSectionProps;

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

const index: React.FC<TransferredProps> = (props: AircraftSectionProps) => {
    const history = useHistory();
    const [selectedAddon, setSelectedAddon] = useState<Addon>(props.publisher.addons[0]);

    useEffect(() => {
        settings.set("cache.main.sectionToShow", history.location.pathname);

        let firstAvailableAddon: Addon;

        props.publisher.addons.forEach((addon) => {
            if (addon.enabled) {
                firstAvailableAddon = addon;
            }
        });

        if (!firstAvailableAddon) {
            history.push("/aircraft-section/no-available-addons");
            return;
        }

        fetchLatestVersionNames(firstAvailableAddon).then(() => {
            setSelectedAddon(firstAvailableAddon);
        });
    }, []);

    const findInstalledTrack = (): AddonTrack => {
        if (!Directories.isFragmenterInstall(selectedAddon)) {
            console.log("Not installed");
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(selectedAddon.tracks[0]);
                return selectedAddon.tracks[0];
            }
        }

        try {
            const manifest = getCurrentInstall(
                Directories.inCommunity(selectedAddon.targetDirectory)
            );
            console.log("Currently installed", manifest);

            let track = _.find(selectedAddon.tracks, { url: manifest.source });
            if (!track) {
                track = _.find(selectedAddon.tracks, {
                    alternativeUrls: [manifest.source],
                });
            }
            console.log("Currently installed", track);
            setInstalledTrack(track);
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(track);
                return track;
            }
        } catch (e) {
            console.error(e);
            console.log("Not installed");
            if (selectedTrack()) {
                selectAndSetTrack(selectedTrack().key);
                return selectedTrack();
            } else {
                setSelectedTrack(selectedAddon.tracks[0]);
                return selectedAddon.tracks[0];
            }
        }
    };

    const installedTrack = (): AddonTrack => {
        try {
            return props.installedTracks[selectedAddon.key] as AddonTrack;
        } catch (e) {
            setInstalledTrack(null);
            return null;
        }
    };
    const setInstalledTrack = (newInstalledTrack: AddonTrack) => {
        store.dispatch({
            type: actionTypes.SET_INSTALLED_TRACK,
            addonKey: selectedAddon.key,
            payload: newInstalledTrack,
        });
    };

    const selectedTrack = (): AddonTrack => {
        try {
            return props.selectedTracks[selectedAddon.key] as AddonTrack;
        } catch (e) {
            setSelectedTrack(null);
            return null;
        }
    };

    const setSelectedTrack = (newSelectedTrack: AddonTrack) => {
        store.dispatch({
            type: actionTypes.SET_SELECTED_TRACK,
            addonKey: selectedAddon.key,
            payload: newSelectedTrack,
        });
    };

    const installStatus = (): InstallStatus => {
        try {
            return props.installStatus[selectedAddon.key] as InstallStatus;
        } catch (e) {
            setInstallStatus(InstallStatus.Unknown);
            return InstallStatus.Unknown;
        }
    };

    const setInstallStatus = (new_state: InstallStatus) => {
        store.dispatch({
            type: actionTypes.SET_INSTALL_STATUS,
            addonKey: selectedAddon.key,
            payload: new_state,
        });
    };

    const [msfsIsOpen, setMsfsIsOpen] = useState<MsfsStatus>(MsfsStatus.Checking);

    const [wait, setWait] = useState(1);

    const [releases, setReleases] = useState<AddonVersion[]>([]);

    useEffect(() => {
        getAddonReleases(selectedAddon).then((releases) => {
            setReleases(releases);
            setWait((wait) => wait - 1);
            findInstalledTrack();
        });
    }, [selectedAddon]);

    const download: DownloadItem = useSelector((state: InstallerStore) =>
        _.find(state.downloads, { id: selectedAddon.name })
    );
    const dispatch = useDispatch();

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
        if (!isDownloading && installStatus() !== InstallStatus.DownloadPrep) {
            getInstallStatus().then(setInstallStatus);
        }
    }, [selectedTrack(), installedTrack()]);

    useEffect(() => {
        if (download && isDownloading) {
            ipcRenderer.send("set-window-progress-bar", download.progress / 100);
        } else {
            ipcRenderer.send("set-window-progress-bar", -1);
        }
    }, [download]);

    const [addonDiscovered, setAddonDiscovered] = useSetting<boolean>(
        "cache.main.discoveredAddons." + selectedAddon.key
    );

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
            setInstallStatus(InstallStatus.DownloadPrep);
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
            setInstallStatus(InstallStatus.Downloading);
            dispatch(registerDownload(selectedAddon.name, ""));

            // Perform the fragmenter download
            const installer = new FragmenterInstaller(track.url, tempDir);

            installer.on("downloadStarted", (module) => {
                console.log("Downloading started for module", module.name);
                setInstallStatus(InstallStatus.Downloading);
            });
            installer.on("downloadProgress", (module, progress) => {
                if (lastPercent !== progress.percent) {
                    lastPercent = progress.percent;
                    dispatch(
                        updateDownloadProgress(
                            selectedAddon.name,
                            module.name,
                            progress.percent
                        )
                    );
                }
            });
            installer.on("unzipStarted", (module) => {
                console.log("Started unzipping module", module.name);
                setInstallStatus(InstallStatus.Decompressing);
            });
            installer.on("retryScheduled", (module, retryCount, waitSeconds) => {
                console.log("Scheduling a retry for module", module.name);
                console.log("Retry count", retryCount);
                console.log("Waiting for", waitSeconds, "seconds");

                setInstallStatus(InstallStatus.DownloadRetry);
            });
            installer.on("retryStarted", (module, retryCount) => {
                console.log("Starting a retry for module", module.name);
                console.log("Retry count", retryCount);

                setInstallStatus(InstallStatus.Downloading);
            });

            console.log("Starting fragmenter download for URL", track.url);
            const installResult = await installer.install(signal, {
                forceCacheBust: !(settings.get("mainSettings.useCdnCache") as boolean),
                forceFreshInstall: false,
                forceManifestCacheBust: true,
            });
            console.log("Fragmenter download finished for URL", track.url);

            // Copy files from temp dir
            setInstallStatus(InstallStatus.DownloadEnding);
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

            dispatch(deleteDownload(selectedAddon.name));
            notifyDownload(true);

            // Flash completion text
            setInstalledTrack(track);
            setInstallStatus(InstallStatus.DownloadDone);

            console.log("Finished download", installResult);
        } catch (e) {
            if (signal.aborted) {
                setInstallStatus(InstallStatus.DownloadCanceled);
            } else {
                console.error(e);
                setInstallStatus(InstallStatus.DownloadError);
                notifyDownload(false);
            }
            setTimeout(async () => setInstallStatus(await getInstallStatus()), 3_000);
        }

        dispatch(deleteDownload(selectedAddon.name));

        // Clean up temp dir
        Directories.removeAllTemp();
    };

    const selectAndSetTrack = async (key: string) => {
        const newTrack = selectedAddon.tracks.find((x) => x.key === key);
        setSelectedTrack(newTrack);
    };

    const handleTrackSelection = (track: AddonTrack) => {
        if (!isDownloading && installStatus() !== InstallStatus.DownloadPrep) {
            dispatch(
                callWarningModal(
                    track.isExperimental,
                    track,
                    !track.isExperimental,
                    () => selectAndSetTrack(track.key)
                )
            );
        } else {
            selectAndSetTrack(selectedTrack().key);
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
            dispatch(deleteDownload(selectedAddon.name));
        }
    };

    const notifyDownload = (successful: boolean) => {
        console.log("Requesting notification");
        Notification.requestPermission()
            .then(function () {
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

    const activeState = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <StateText>
                    {msfsIsOpen === MsfsStatus.Open
                        ? "Please close MSFS"
                        : "Checking status..."}
                </StateText>
            );
        }

        switch (installStatus()) {
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
        }
    };

    const activeInstallButton = (): JSX.Element => {
        if (msfsIsOpen !== MsfsStatus.Closed) {
            return (
                <InstallButton className="bg-gray-700 text-grey-medium pointer-events-none">
                    Update
                </InstallButton>
            );
        }

        switch (installStatus()) {
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
                        className="pointer-events-none bg-green-500"
                        onClick={handleInstall}
                    >
                        Installed
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
        }
    };

    const liveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries.map((entry) => entry.livery);
    });

    return (
        <div className="flex flex-row w-full h-full">
            <PageSider
                className="flex-none bg-navy-medium shadow-2xl h-full"
                style={{ width: "26rem" }}
            >
                <div className="h-full flex flex-col divide-y divide-gray-700">
                    <AddonBar publisher={props.publisher}>
                        {props.publisher.addons.map((addon) => (
                            <AddonBarItem
                                selected={selectedAddon.key === addon.key && addon.enabled}
                                enabled={addon.enabled}
                                className="h-32"
                                addon={addon}
                                onClick={() => setSelectedAddon(addon)}
                            />
                        ))}
                    </AddonBar>
                </div>
            </PageSider>
            <div
                className={`bg-navy-light w-full flex flex-col h-full ${wait || (selectedAddon.hidden && !addonDiscovered)
                    ? "hidden"
                    : "visible"
                } ${selectedAddon.name}`}
            >
                <div className="flex flex-row h-full relative">
                    <div className="w-full">
                        <Route path="/aircraft-section">
                            <Redirect to="/aircraft-section/main/configure" />
                        </Route>
                        <Route path="/aircraft-section/no-available-addons">
                            <NoAvailableAddonsSection />
                        </Route>
                        <Route path="/aircraft-section/main">
                            <div className="h-full">
                                <div
                                    className="h-1/2 relative bg-cover bg-center"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url(${selectedAddon.backgroundImageUrl})`,
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 flex flex-row items-end justify-between p-6 w-full">
                                        <div>
                                            {activeState()}
                                            {/* TODO: Actually calculate this value */}
                                            {installStatus() === InstallStatus.Downloading && (
                                                <div className="text-white text-2xl">98.7 mb/s</div>
                                            )}
                                        </div>
                                        {installStatus() === InstallStatus.Downloading && (
                                            // TODO: Replace this with a JIT value
                                            <div
                                                className="text-white font-semibold"
                                                style={{ fontSize: "38px" }}
                                            >
                                                {download?.progress}%
                                            </div>
                                        )}
                                    </div>
                                    {installStatus() === InstallStatus.Downloading && (
                                        <div
                                            className="absolute -bottom-1 w-full h-2 z-10 bg-cyan progress-bar-animated"
                                            style={{ width: `${download?.progress}%` }}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-row h-1/2">
                                    {liveries.length > 0 && (
                                        <DialogContainer>
                                            <LiveryConversionDialog />
                                        </DialogContainer>
                                    )}
                                    <Route path="/aircraft-section/main/configure">
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
                                                    <h5 className="text-base text-teal-50 mt-2">
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

                                                    {selectedAddon.tracks.filter((track) => track.isExperimental)
                                                        .length > 0 && (
                                                        <h5 className="text-base text-teal-50 ">
                                                    Experimental versions
                                                        </h5>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-10">
                                                <h2 className="text-white font-extrabold">Description</h2>
                                                <p className="text-xl text-white font-manrope leading-relaxed">
                                                    {selectedTrack().description}
                                                </p>
                                            </div>
                                        </div>
                                    </Route>
                                    <Route path="/aircraft-section/main/release-notes">
                                        <div>
                                            <ReleaseNotes addon={selectedAddon} />
                                        </div>
                                    </Route>
                                    <Route path="/aircraft-section/main/changelog">
                                        <Changelog />
                                    </Route>
                                    <Route path="/aircraft-section/main/about">
                                        <About addon={selectedAddon}/>
                                    </Route>
                                    <div className="flex flex-col items-center ml-auto justify-between h-full relative bg-navy p-7 flex-shrink-0">
                                        <div className="flex flex-col items-start place-self-start space-y-7">
                                            <SideBarLink to="/aircraft-section/main/configure">
                                                <Sliders size={24} />
                                                Configure
                                            </SideBarLink>
                                            <SideBarLink to="/aircraft-section/main/release-notes">
                                                <JournalText size={24} />
                                                Release Notes
                                            </SideBarLink>
                                            <SideBarLink to="/aircraft-section/main/changelog">
                                                {/* <ListColumnsReverse size={24} /> TODO: USE THIS INSTEAD */}
                                                <CardText size={24} />
                                                Change Log
                                            </SideBarLink>
                                            {/* <SideBarLink to="/aircraft-section/main/liveries">
                                                <Palette size={24} />
                                                Liveries
                                            </SideBarLink> */}
                                            <SideBarLink to="/aircraft-section/main/about">
                                                <InfoCircle size={24} />
                                                About
                                            </SideBarLink>
                                        </div>
                                        <div>{activeInstallButton()}</div>
                                        <div
                                            className={`bg-navy text-white flex h-full justify-center items-center ${!wait && selectedAddon.hidden && !addonDiscovered
                                                ? "visible"
                                                : "hidden"
                                            } ${selectedAddon.name}`}
                                        >
                                            <div className="h-1/5 w-1/5">
                                                <img
                                                    onClick={() => {
                                                        setAddonDiscovered(true);
                                                    }}
                                                    src={FBWTail}
                                                    alt="FlyByWire Logo"
                                                    id="fbw-logo"
                                                    style={{ transform: "scale(1.35)" }}
                                                />
                                            </div>
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
    <div className="h-full p-7 overflow-y-scroll">
        <h2 className="text-white font-extrabold">About</h2>
        <p className="text-xl text-white font-manrope leading-relaxed">
            {addon.description}
        </p>
    </div>
);

const ReleaseNotes: FC<{addon: Addon}> = ({ addon }) => {
    const [releases, setReleases] = useState<ReleaseInfo[]>([]);

    useEffect(() => {
        GitVersions.getReleases(addon.repoOwner, addon.repoName).then(res => setReleases((res)));
    }, []);

    console.log(releases);

    return (
        <div className="w-full h-full p-7 overflow-y-scroll">
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-white font-extrabold">
                    Release Notes
                </h2>
                {/*    Dropdown will go here*/}
            </div>
            <div className="flex flex-col gap-y-7">
                {releases.map(release =>
                    <div className="rounded-md bg-navy p-7 ">
                        <h3 className="text-white font-semibold">{release.name}</h3>
                        <ReactMarkdown
                            className="text-lg text-gray-300"
                            children={release.body ?? ''}
                            remarkPlugins={[remarkGfm]}
                            linkTarget={"_blank"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const Changelog = () => {
    const URL = 'https://api.github.com/repos/flybywiresim/a32nx/contents/.github/CHANGELOG.md';
    const [arr, setArr] = useState<string[]>([]);

    useEffect(() => {
        fetch(URL, {
            headers: {
                'accept': 'application/vnd.github.v3.raw',
            }
        })
            .then(res => res.text())
            .then(text => text.split('1.').slice(3))
            .then(lines => setArr(lines));
    }, []);

    return (
        <div className="h-full p-7 overflow-y-scroll">
            <h2 className="text-white font-extrabold">Changelog</h2>
            <ol className="text-white">
                {arr.map(entry => (
                    <li className="font-mono">
                        {entry}
                    </li>
                ))}
            </ol>
        </div>
    );
};

const mapStateToProps = (state: ConnectedAircraftSectionProps) => {
    return {
        ...state,
    };
};

export default connect(mapStateToProps)(index);
