import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from "renderer/redux/store";
import { ReleaseData } from "renderer/redux/types";

const initialState: ReleaseData[] = [];

export const releaseNotesSlice = createSlice({
    name: "releaseNotes",
    initialState,
    reducers: {
        setReleases: (state, action: TypedAction<{ releases: ReleaseData[] }>) => {
            state.splice(0, state.length, ...action.payload.releases);
        }
    }
});

export const { setReleases } = releaseNotesSlice.actions;
export default releaseNotesSlice.reducer;
