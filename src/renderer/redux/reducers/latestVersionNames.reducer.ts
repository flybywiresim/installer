import * as actionTypes from '../actionTypes';
import { ModAndTrackLatestVersionNamesState, SetModAndTrackLatestReleaseInfo } from '../types';

const initialState: ModAndTrackLatestVersionNamesState = [];

const reducer = (state = initialState, action: SetModAndTrackLatestReleaseInfo): ModAndTrackLatestVersionNamesState => {
    switch (action.type) {
        case actionTypes.SET_MOD_AND_TRACK_LATEST_RELEASE_INFO:
            return [...state, action.payload];
        default:
            return state;
    }
};

export default reducer;
