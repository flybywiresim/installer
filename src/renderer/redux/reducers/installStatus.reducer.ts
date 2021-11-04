import { InstallAction } from "../types";
import * as actionTypes from '../actionTypes';
import { InstallStatus } from "renderer/components/AircraftSection";

const initialState : Record<string, InstallStatus> = null;

const reducer = (state = initialState, action: InstallAction) => {
    switch (action.type) {
        case actionTypes.SET_INSTALL_STATUS:
            return {
                ...state,
                [action.addonKey]: action.payload,
                }
        default:
            return state;
    }
};

export default reducer;
