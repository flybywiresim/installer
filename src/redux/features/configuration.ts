import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "../store";
import { Configuration } from "../../utils/InstallerConfiguration";

const initialState: Configuration = { publishers: [] };

export const configurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {
        setConfiguration: (state, action: TypedAction<{ configuration: Configuration }>) => {
            state.publishers = action.payload.configuration.publishers;
        },
    },
});

export const { setConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer;
