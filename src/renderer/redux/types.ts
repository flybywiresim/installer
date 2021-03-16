import * as actions from './actionTypes';
import { ModTrack } from "renderer/components/App";
import { InstallStatus } from 'renderer/components/AircraftSection';

export interface DownloadItem {
    id: string
    progress: number
    module: string
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

export type ModAndTrackLatestVersionNamesState = { modKey: string, trackKey: string, name: string }[]

export interface SetModAndTrackLatestVersionName {
    type: typeof actions.SET_MOD_AND_TRACK_LATEST_VERSION_NAME
    payload: {
        modKey: string,
        trackKey: string,
        name: string
    }
}

export interface ChangelogState {
    showchangelog: boolean
}

export interface ChangelogAction {
    type: typeof actions.CALL_CHANGELOG
    payload: {
        showchangelog: boolean
    }
}

export type DownloadActionType = UpdateDownloadProgressAction | RegisterNewDownloadProgressAction | DeleteDownloadAction

export interface RootStore {
    downloads: DownloadsState
}
