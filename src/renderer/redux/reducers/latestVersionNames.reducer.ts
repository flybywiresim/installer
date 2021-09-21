import * as actionTypes from '../actionTypes';
import { AddonAndTrackLatestVersionNamesState, SetAddonAndTrackLatestReleaseInfo } from '../types';

const initialState: AddonAndTrackLatestVersionNamesState = [];

const reducer = (state = initialState, action: SetAddonAndTrackLatestReleaseInfo): AddonAndTrackLatestVersionNamesState => {
    switch (action.type) {
        case actionTypes.SET_ADDON_AND_TRACK_LATEST_RELEASE_INFO:
            return [...state, action.payload];
        default:
            return state;
    }
};

export default reducer;
