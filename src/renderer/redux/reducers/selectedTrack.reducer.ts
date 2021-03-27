import * as actionTypes from '../actionTypes';
import { SelectedTrackAction } from '../types';
import { ModTrack } from "renderer/utils/InstallerConfiguration";

const initialState : ModTrack = null;

const reducer = (state = initialState, action: SelectedTrackAction) :ModTrack => {
    switch (action.type) {
        case actionTypes.SET_SELECTED_TRACK:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
