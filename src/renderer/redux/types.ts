import { Addon, AddonTrack } from "renderer/utils/InstallerConfiguration";
import { ReleaseInfo } from "renderer/utils/AddonData";

export interface DownloadItem {
    id: string
    progress: number
    module: string,
}

export type DownloadsState = DownloadItem[];

export interface ShowWarningModalState {
    showWarningModal: boolean,
    track: null | AddonTrack,
    selectedAddon: Addon
}

export interface ReleaseData {
    name: string;
    publishedAt: number;
    htmlUrl: string;
    body: string;
}

export type ReleaseNotesState = ReleaseData[];

export type AddonAndTrackLatestVersionNamesState = { addonKey: string, trackKey: string, info: ReleaseInfo }[]

export interface ChangelogState {
    showChangelog: boolean
}
