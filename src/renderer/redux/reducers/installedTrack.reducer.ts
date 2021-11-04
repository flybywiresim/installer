import * as actionTypes from '../actionTypes';
import { InstalledTrackAction, } from '../types';
import { AddonTrack } from "renderer/utils/InstallerConfiguration";

const initialState : Record<string, AddonTrack> = null;

const reducer = (state = initialState, action: InstalledTrackAction) => {
    switch (action.type) {
        case actionTypes.SET_INSTALLED_TRACK:
            return {
                ...state,
                [action.addonKey]: action.payload,
                }
        default:
            return state;
    }
};

export default reducer;
