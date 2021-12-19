import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "renderer/redux/store";
import { ShowWarningModalState } from "renderer/redux/types";
import { Addon, AddonTrack } from "renderer/utils/InstallerConfiguration";

const initialState: ShowWarningModalState = {
    showWarningModal: false,
    track: null,
    selectedAddon: null,
};

export const warningModalSlice = createSlice({
    name: "warningModal",
    initialState,
    reducers: {
        callWarningModal: (state, action: TypedAction<{showWarningModal: boolean, track: null | AddonTrack, selectedAddon: Addon | null }>) => {
            state.showWarningModal = action.payload.showWarningModal;
            state.track = action.payload.track;
            state.selectedAddon = action.payload.selectedAddon;
        },
    },
});

export const { callWarningModal } = warningModalSlice.actions;
export default warningModalSlice.reducer;
