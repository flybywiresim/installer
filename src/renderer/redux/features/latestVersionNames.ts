import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "renderer/redux/store";
import { AddonAndTrackLatestVersionNamesState } from "renderer/redux/types";

const initialState: AddonAndTrackLatestVersionNamesState = [];

export const latestVersionNamesSlice = createSlice({
    name: "latestVersionNames",
    initialState,
    reducers: {
        setAddonAndTrackLatestReleaseInfo: (state, action: TypedAction<{ addonTrackAndInfo: AddonAndTrackLatestVersionNamesState }>) => {
            state.push(...action.payload.addonTrackAndInfo);
        },
    },
});

export const { setAddonAndTrackLatestReleaseInfo } = latestVersionNamesSlice.actions;
export default latestVersionNamesSlice.reducer;
