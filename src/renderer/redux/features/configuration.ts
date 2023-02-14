import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "../store";
import { Configuration, Publisher } from "renderer/utils/InstallerConfiguration";

const initialState: Configuration = { version: 0, publishers: [] };

export const configurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {
        setConfiguration: (state, action: TypedAction<{ configuration: Configuration }>) => {
            state.publishers = action.payload.configuration.publishers;
        },
        addPublisher: (state, action: TypedAction<{ publisher: Publisher }>) => {
            state.publishers.push(action.payload.publisher);
        },
    },
});

export const { setConfiguration, addPublisher } = configurationSlice.actions;
export default configurationSlice.reducer;
