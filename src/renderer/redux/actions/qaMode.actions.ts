import * as actionTypes from "../actionTypes";
import { qaModeAction } from "../types";

export function callQAMode(enable: boolean): qaModeAction {
    return {
        type: actionTypes.CALL_QA_MODE,
        payload: {
            qaMode: enable,
        }
    };
}
