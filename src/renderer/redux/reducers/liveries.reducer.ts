/* eslint-disable no-case-declarations */
import { LiveryAction } from "../types";
import * as actionTypes from '../actionTypes';
import { LiveryDefinition } from "renderer/utils/LiveryConversion";

export enum LiveryState {
    DETECTED,
    TO_BE_CONVERTED,
    CONVERTED,
    ERROR_DURING_CONVERSION,
}

export type RegularLiveryStateEntry = {
    livery: LiveryDefinition,
    state: LiveryState.DETECTED | LiveryState.TO_BE_CONVERTED | LiveryState.CONVERTED,
}

export type ErrorLiveryStateEntry = {
    livery: LiveryDefinition,
    state: LiveryState.ERROR_DURING_CONVERSION,
    error: Error,
}

export type LiveryStateEntry = RegularLiveryStateEntry | ErrorLiveryStateEntry

export type LiveriesState = LiveryStateEntry[];

const initialState: LiveriesState = [];

const reducer = (state = initialState, action: LiveryAction): LiveriesState => {
    switch (action.type) {
        case actionTypes.SET_LIVERY_STATE:
            const matchingEntryIndex = state.findIndex((entry) => entry.livery === action.payload.livery);

            const newState = state;

            if (matchingEntryIndex >= 0) {
                newState[matchingEntryIndex] = action.payload;
            } else {
                newState.push(action.payload);
            }

            return newState;
        case actionTypes.CLEAR_LIVERIES_STATE:
            return [];
        default:
            return state;
    }
};

export default reducer;
