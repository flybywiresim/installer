import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "renderer/redux/store";
import { InstallStatus } from "renderer/components/AddonSection/Enums";

const initialState : Record<string, InstallStatus> = {};

export const installStatus = createSlice({
    name: "installStatus",
    initialState,
    reducers: {
        setInstallStatus: (state, action: TypedAction<{ addonKey: string, installStatus: InstallStatus }>) => {
            state[action.payload.addonKey] = action.payload.installStatus;
        },
    }
});

export const { setInstallStatus } = installStatus.actions;
export default installStatus.reducer;
