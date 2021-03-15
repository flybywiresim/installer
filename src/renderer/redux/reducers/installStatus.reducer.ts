import { InstallAction } from "../types";
import * as actionTypes from '../actionTypes';
import { InstallStatus } from "renderer/components/AircraftSection";

const initialState : InstallStatus = InstallStatus.Unknown;

const reducer = (state = initialState, action: InstallAction) :InstallStatus => {
    switch (action.type) {
        case actionTypes.SET_INSTALL_STATUS:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;
