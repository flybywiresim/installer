import * as actionTypes from "../actionTypes";
import { DeleteDownloadAction, RegisterNewDownloadProgressAction, UpdateDownloadProgressAction } from "../types";

export function registerDownload(id: string, infoText: string): RegisterNewDownloadProgressAction {
    return {
        type: actionTypes.REGISTER_NEW_DOWNLOAD,
        payload: {
            id,
            infoText,
        }
    };
}

export function updateDownloadProgress(
    id: string,
    infoText: string,
    buttonText: string,
    canCancel: boolean,
    progress: number
): UpdateDownloadProgressAction {
    return {
        type: actionTypes.UPDATE_DOWNLOAD_PROGRESS,
        payload: {
            id,
            progress,
            infoText,
            buttonText,
            canCancel,
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
