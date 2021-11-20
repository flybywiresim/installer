import * as actionTypes from '../actionTypes';
import { SelectedTrackAction } from '../types';
import { AddonTrack } from "renderer/utils/InstallerConfiguration";

const initialState : Record<string, AddonTrack> = null;

const reducer = (state = initialState, action: SelectedTrackAction): Record<string, AddonTrack> => {
    switch (action.type) {
        case actionTypes.SET_SELECTED_TRACK:
            return {
                ...state,
                [action.addonKey]: action.payload,
            };
        default:
            return state;
    }
};

export default reducer;
