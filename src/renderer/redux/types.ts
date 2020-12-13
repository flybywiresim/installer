import * as actions from './actionTypes'

export interface DownloadItem {
    id: string
    progress: number
} 

export type DownloadsState = DownloadItem[];

export interface UpdateDownloadProgressAction {
    type: typeof actions.UPDATE_DOWNLOAD_PROGRESS
    payload: {
        id: string
        progress: number
    }
}

export interface RegisterNewDownloadProgressAction {
    type: typeof actions.REGISTER_NEW_DOWNLOAD
    payload: {
        id: string
    }
}


export interface DeleteDownloadAction {
    type: typeof actions.DELETE_DOWNLOAD
    payload: {
        id: string
    }
}



export type DownloadActionType = UpdateDownloadProgressAction | RegisterNewDownloadProgressAction | DeleteDownloadAction

export interface RootStore {
    downloads: DownloadsState
}