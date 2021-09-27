import * as actionTypes from '../actionTypes';
import { SelectedTrackAction } from '../types';
import { AddonTrack } from "renderer/utils/InstallerConfiguration";

const initialState : AddonTrack = null;

const reducer = (state = initialState, action: SelectedTrackAction) :AddonTrack => {
    switch (action.type) {
        case actionTypes.SET_SELECTED_TRACK:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
