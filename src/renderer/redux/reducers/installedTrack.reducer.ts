import * as actionTypes from '../actionTypes';
import { InstalledTrackAction } from '../types';
import { AddonTrack } from "renderer/utils/InstallerConfiguration";

const initialState : AddonTrack = null;

const reducer = (state = initialState, action: InstalledTrackAction) :AddonTrack => {
    switch (action.type) {
        case actionTypes.SET_INSTALLED_TRACK:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
