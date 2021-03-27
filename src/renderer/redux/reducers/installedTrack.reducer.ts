import * as actionTypes from '../actionTypes';
import { InstalledTrackAction } from '../types';
import { ModTrack } from "renderer/utils/InstallerConfiguration";

const initialState : ModTrack = null;

const reducer = (state = initialState, action: InstalledTrackAction) :ModTrack => {
    switch (action.type) {
        case actionTypes.SET_INSTALLED_TRACK:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
