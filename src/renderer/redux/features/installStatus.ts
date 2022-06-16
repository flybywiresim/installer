import { createSlice } from "@reduxjs/toolkit";
import { TypedAction } from "renderer/redux/store";
import { InstallStatus } from "renderer/components/AddonSection/Enums";

interface BaseInstallState {
    status: InstallStatus,
}

export interface InstallingDependencyInstallState extends BaseInstallState {
    status: InstallStatus.InstallingDependency,
    dependencyPublisherKey: string,
    dependencyAddonKey: string,
}

export interface GenericInstallState {
    status: Exclude<InstallStatus, InstallStatus.InstallingDependency>,
}

export type InstallState = GenericInstallState | InstallingDependencyInstallState

const initialState : Record<string, InstallState> = {};

export const installStatus = createSlice({
    name: "installStatus",
    initialState,
    reducers: {
        setInstallStatus: (state, action: TypedAction<{ addonKey: string, installState: InstallState }>) => {
            state[action.payload.addonKey] = action.payload.installState;
        },
    },
});

export const { setInstallStatus } = installStatus.actions;
export default installStatus.reducer;
