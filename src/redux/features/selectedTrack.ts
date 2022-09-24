import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "../store";
import { AddonTrack } from "../../utils/InstallerConfiguration";

const initialState : Record<string, AddonTrack> = {};

export const selectedTrackSlice = createSlice({
    name: "selectedTrack",
    initialState,
    reducers: {
        setSelectedTrack: (state, action: TypedAction<{ addonKey: string, track: AddonTrack }>) => {
            state[action.payload.addonKey] = action.payload.track;
        },
    },
});

export const { setSelectedTrack } = selectedTrackSlice.actions;
export default selectedTrackSlice.reducer;
