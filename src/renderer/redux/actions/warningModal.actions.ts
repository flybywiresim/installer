import * as actionTypes from "../actionTypes";
import { ShowWarningModalAction } from "../types";
import { ModTrack } from "renderer/utils/InstallerConfiguration";

export function callWarningModal(show: boolean, track?: ModTrack, setTrack?: boolean, acceptedCallback?: CallableFunction): ShowWarningModalAction {
    let trackHandler: CallableFunction = null;

    if (acceptedCallback) {
        trackHandler = acceptedCallback;
        if (setTrack) {
            acceptedCallback(track.key);
        }
    }

    return {
        type: actionTypes.CALL_WARNING_MODAL,
        payload: {
            showWarningModal: show,
            track,
            trackHandler: trackHandler,
        }
    };
}
