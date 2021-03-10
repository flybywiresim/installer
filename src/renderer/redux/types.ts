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

export interface InstallStatusState {
    state: InstallStatus,
}

export interface InstallAction {
    type: typeof actions.UPDATE_INSTALL_STATE
    payload: {
        state: InstallStatus
    }
}

export interface SelectedTrackAction {
    type: typeof actions.SELECT_TRACK
    payload: ModTrack
}
export interface InstalledTrackAction {
    type: typeof actions.INSTALLED_TRACK
    payload: ModTrack
}

export interface ChangelogState {
    showchangelog: boolean
}

export interface ChangelogAction {
    type: typeof actions.CHANGELOG
    payload: {
        showchangelog: boolean
    }
}

export type DownloadActionType = UpdateDownloadProgressAction | RegisterNewDownloadProgressAction | DeleteDownloadAction

export interface RootStore {
    downloads: DownloadsState
}
