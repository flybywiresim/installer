import { ShowWarningModalAction, ShowWarningModalState } from "../types";
import * as actionTypes from '../actionTypes';
import produce, { Draft } from "immer";

const initialState: ShowWarningModalState = {
    showWarningModal: false,
    track: null,
    trackHandler: null,
};

const reducer = produce((state: Draft<ShowWarningModalState>, action: ShowWarningModalAction) => {
    switch (action.type) {
        case actionTypes.CALL_WARNING_MODAL:
            state.showWarningModal = action.payload.showWarningModal;
            state.track = action.payload.track;
            state.trackHandler = action.payload.trackHandler;
            break;
    }
}, initialState);

export default reducer;
