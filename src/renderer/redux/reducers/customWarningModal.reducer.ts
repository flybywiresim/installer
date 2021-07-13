import * as actionTypes from '../actionTypes';
import { CustomWarningModalAction, CustomWarningModal } from "../types";

const initialState : CustomWarningModal = {
    active: false,
    id: null,
    targetDirectory: null,
};

const reducer = (state = initialState, action: CustomWarningModalAction) : CustomWarningModal => {
    switch (action.type) {
        case actionTypes.CALL_CUSTOM_WARNING_MODAL:
            return {
                ...action.payload
            };
        default:
            return state;
    }
};

export default reducer;
