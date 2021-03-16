import * as actionTypes from '../actionTypes';
import { SetModAndTrackLatestVersionName } from '../types';

export type ModAndTrackLatestVersionNames = { modKey: string, trackKey: string, name: string }[]

const initialState: ModAndTrackLatestVersionNames = [];

const reducer = (state = initialState, action: SetModAndTrackLatestVersionName): ModAndTrackLatestVersionNames => {
    switch (action.type) {
        case actionTypes.SET_MOD_AND_TRACK_LATEST_VERSION_NAME:
            return [...state, action.payload];
        default:
            return state;
    }
};

export default reducer;
