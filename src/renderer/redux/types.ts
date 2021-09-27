import * as actions from './actionTypes';
import { InstallStatus } from 'renderer/components/AircraftSection';
import { AddonTrack } from "renderer/utils/InstallerConfiguration";
import { ReleaseInfo } from "renderer/utils/AddonData";
import { LiveryStateEntry } from "renderer/redux/reducers/liveries.reducer";

export interface DownloadItem {
    id: string
    progress: number
    module: string,
}

export type DownloadsState = DownloadItem[];

export interface UpdateDownloadProgressAction {
    type: typeof actions.UPDATE_DOWNLOAD_PROGRESS
    payload: {
        id: string
        progress: number
        module: string
    }
}

export interface RegisterNewDownloadProgressAction {
    type: typeof actions.REGISTER_NEW_DOWNLOAD
    payload: {
        id: string
        module: string
    }
}

export interface DeleteDownloadAction {
    type: typeof actions.DELETE_DOWNLOAD
    payload: {
        id: string
    }
}

export interface ShowWarningModalState {
    showWarningModal: boolean,
    track: null | AddonTrack,
    trackHandler: null | CallableFunction,
}

export interface ShowWarningModalAction {
    type: typeof actions.CALL_WARNING_MODAL
    payload: {
        showWarningModal: boolean,
        track: null | AddonTrack,
        trackHandler: null | CallableFunction,
    }
}

export interface InstallAction {
    type: typeof actions.SET_INSTALL_STATUS
    payload: InstallStatus
}

export interface SelectedTrackAction {
    type: typeof actions.SET_SELECTED_TRACK
    payload: AddonTrack
}

export interface InstalledTrackAction {
    type: typeof actions.SET_INSTALLED_TRACK
    payload: AddonTrack
}

export interface SetLiveryStateAction {
    type: typeof actions.SET_LIVERY_STATE,
    payload: LiveryStateEntry,
}

export interface ClearLiveriesStateAction {
    type: typeof actions.CLEAR_LIVERIES_STATE,
}

export type LiveryAction = SetLiveryStateAction | ClearLiveriesStateAction;

export type AddonAndTrackLatestVersionNamesState = { addonKey: string, trackKey: string, info: ReleaseInfo }[]

export interface SetAddonAndTrackLatestReleaseInfo {
    type: typeof actions.SET_ADDON_AND_TRACK_LATEST_RELEASE_INFO
    payload: {
        addonKey: string,
        trackKey: string,
        info: ReleaseInfo,
    }
}

export interface ChangelogState {
    showChangelog: boolean
}

export interface ChangelogAction {
    type: typeof actions.CALL_CHANGELOG
    payload: {
        showChangelog: boolean
    }
}

export type DownloadActionType = UpdateDownloadProgressAction | RegisterNewDownloadProgressAction | DeleteDownloadAction

export interface RootStore {
    downloads: DownloadsState
}
