import * as actionTypes from "../actionTypes";
import { ShowWarningModalAction } from "../types";
import { ModTrack } from "renderer/components/App";

export function callWarningModal(show: boolean, track: ModTrack | null, setTrack?: boolean, findAndSetTrack?: null | CallableFunction): ShowWarningModalAction {
    let trackHandle: null | CallableFunction = null;

    if (typeof findAndSetTrack !== 'undefined' && typeof findAndSetTrack !== null) {
        trackHandle = findAndSetTrack;
        if (typeof setTrack !== 'undefined' && setTrack) {
            findAndSetTrack(track.key);
        }
    }

    return {
        type: actionTypes.CALL_WARNING_MODAL,
        payload: {
            showWarningModal: show,
            track,
            trackHandle,
        }
    };
}
