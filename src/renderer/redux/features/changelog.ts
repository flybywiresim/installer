import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "renderer/redux/store";

const initialState = {
    showChangelog: false
};

export const changelogSlice = createSlice({
    name: 'changelog',
    initialState,
    reducers: {
        callChangelog: (state, action: TypedAction<{ showChangelog: boolean }>) => {
            state.showChangelog = action.payload.showChangelog;
        },
    },
});

export const { callChangelog } = changelogSlice.actions;
export default changelogSlice.reducer;
