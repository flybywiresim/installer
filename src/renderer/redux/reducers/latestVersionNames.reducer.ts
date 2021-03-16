import * as actionTypes from '../actionTypes';
import { ModAndTrackLatestVersionNamesState, SetModAndTrackLatestVersionName } from '../types';

const initialState: ModAndTrackLatestVersionNamesState = [];

const reducer = (state = initialState, action: SetModAndTrackLatestVersionName): ModAndTrackLatestVersionNamesState => {
    switch (action.type) {
        case actionTypes.SET_MOD_AND_TRACK_LATEST_VERSION_NAME:
            return [...state, action.payload];
        default:
            return state;
    }
};

export default reducer;
