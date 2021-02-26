import { qaModeState, qaModeAction } from "../types";
import * as actionTypes from '../actionTypes';
import produce, { Draft } from "immer";
import Store from "electron-store";

const settings = new Store;

const initialState: qaModeState = {
    qaMode: settings.get('mainSettings.qaInstaller') as boolean,
};

const reducer = produce((state: Draft<qaModeState>, action: qaModeAction) => {
    switch (action.type) {
        case actionTypes.CALL_QA_MODE:
            state.qaMode = action.payload.qaMode;
            break;
    }
}, initialState);

export default reducer;
