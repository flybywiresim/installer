import * as actionTypes from '../actionTypes';
import { ModTrack } from "renderer/components/App";
import { InstalledTrackAction } from '../types';

const initialState : ModTrack = null;

const reducer = (state = initialState, action: InstalledTrackAction) :ModTrack => {
    switch (action.type) {
        case actionTypes.INSTALLED_TRACK:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
