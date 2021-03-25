import * as actionTypes from "../actionTypes";
import { DeleteDownloadAction, RegisterNewDownloadProgressAction, UpdateDownloadProgressAction } from "../types";

export function registerDownload(id: string, module: string): RegisterNewDownloadProgressAction {
    return {
        type: actionTypes.REGISTER_NEW_DOWNLOAD,
        payload: {
            id,
            module
        }
    };
}

export function updateDownloadProgress(id: string, module: string, progress: number): UpdateDownloadProgressAction {
    return {
        type: actionTypes.UPDATE_DOWNLOAD_PROGRESS,
        payload: {
            id,
            progress,
            module
        }
    };
}

export function deleteDownload(id: string): DeleteDownloadAction {
    return {
        type: actionTypes.DELETE_DOWNLOAD,
        payload: {
            id,
        }
    };
}
