import * as actions from './actionTypes';
import { InstallStatus } from 'renderer/components/AircraftSection';
import { ModTrack } from "renderer/utils/InstallerConfiguration";
import { ReleaseInfo } from "renderer/utils/AddonData";
import { LiveryStateEntry } from "renderer/redux/reducers/liveries.reducer";

export interface DownloadItem {
    id: string
    progress: number
    infoText: string
    buttonText: string
    canCancel: boolean
}

export type DownloadsState = DownloadItem[];

export interface UpdateDownloadProgressAction {
    type: typeof actions.UPDATE_DOWNLOAD_PROGRESS
    payload: {
        id: string
        progress: number
        infoText: string
        buttonText: string
        canCancel: boolean
    }
}

export interface RegisterNewDownloadProgressAction {
    type: typeof actions.REGISTER_NEW_DOWNLOAD
    payload: {
        id: string
        infoText: string
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
    track: null | ModTrack,
    trackHandler: null | CallableFunction,
}

export interface ShowWarningModalAction {
    type: typeof actions.CALL_WARNING_MODAL
    payload: {
        showWarningModal: boolean,
        track: null | ModTrack,
        trackHandler: null | CallableFunction,
    }
}

export interface InstallAction {
    type: typeof actions.SET_INSTALL_STATUS
    payload: InstallStatus
}

export interface SelectedTrackAction {
    type: typeof actions.SET_SELECTED_TRACK
    payload: ModTrack
}

export interface InstalledTrackAction {
    type: typeof actions.SET_INSTALLED_TRACK
    payload: ModTrack
}

export interface SetLiveryStateAction {
    type: typeof actions.SET_LIVERY_STATE,
    payload: LiveryStateEntry,
}

export interface ClearLiveriesStateAction {
    type: typeof actions.CLEAR_LIVERIES_STATE,
}

export type LiveryAction = SetLiveryStateAction | ClearLiveriesStateAction;

export type ModAndTrackLatestVersionNamesState = { modKey: string, trackKey: string, info: ReleaseInfo }[]

export interface SetModAndTrackLatestReleaseInfo {
    type: typeof actions.SET_MOD_AND_TRACK_LATEST_RELEASE_INFO
    payload: {
        modKey: string,
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
