import { DownloadActionType, DownloadsState } from "../types";
import * as actionTypes from '../actionTypes';
import produce, { Draft } from "immer";
import _ from 'lodash';

const initialState: DownloadsState = [];

const reducer = produce((downloads: Draft<DownloadsState>, action: DownloadActionType) => {
    switch (action.type) {
        case actionTypes.UPDATE_DOWNLOAD_PROGRESS:
            downloads.forEach(download => {
                if (download.id === action.payload.id) {
                    download.progress = action.payload.progress;
                }
            });
            break;
        case actionTypes.REGISTER_NEW_DOWNLOAD:
            downloads.push({
                id: action.payload.id,
                progress: 0
            });
            break;
        case actionTypes.DELETE_DOWNLOAD:
            _.remove(downloads, download => download.id === action.payload.id);
            break;
    }
}, initialState);

export default reducer;
