import { InstallAction } from "../types";
import * as actionTypes from '../actionTypes';
import { InstallStatus } from "renderer/components/AircraftSection";

const initialState : InstallStatus = InstallStatus.Unknown;

const reducer = (state: any = initialState, action: InstallAction) => {
    switch (action.type) {
        case actionTypes.SET_INSTALL_STATUS:
            return {
                ...state,
                [action.addonKey]: {
                    installStatus: action.payload,
                }
                 };
        default:
            return state;
    }
};

export default reducer;
