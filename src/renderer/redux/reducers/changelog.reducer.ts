import * as actionTypes from '../actionTypes';
import { ChangelogAction, ChangelogState } from "../types";

const initialState = {
    showchangelog: false
};

const reducer = (state = initialState, action: ChangelogAction) : ChangelogState => {
    switch (action.type) {
        case actionTypes.CALL_CHANGELOG:
            return {
                ...action.payload
            };
        default:
            return state;
    }
};

export default reducer;
