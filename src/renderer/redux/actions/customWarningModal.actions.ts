import * as actionTypes from "../actionTypes";
import { CustomWarningModalAction } from "../types";

export function callCustomWarningModal(active: boolean, id?: string, targetDirectory?: string): CustomWarningModalAction {

    return {
        type: actionTypes.CALL_CUSTOM_WARNING_MODAL,
        payload: {
            active: active,
            id: id,
            targetDirectory: targetDirectory,
        }
    };
}
