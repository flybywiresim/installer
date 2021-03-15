import * as actionTypes from '../actionTypes';
import { ModTrack } from "renderer/components/App";
import { SelectedTrackAction } from '../types';

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
