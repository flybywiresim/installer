import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';

interface BaseInstallState {
  status: InstallStatus;
}

export interface GenericInstallState {
  status: Exclude<
    InstallStatus,
    InstallStatus.InstallingDependency | InstallStatus.InstallingDependencyEnding | InstallStatus.Decompressing
  >;
}

export interface InstallingDependencyInstallState extends BaseInstallState {
  status: InstallStatus.InstallingDependency;
  dependencyPublisherKey: string;
  dependencyAddonKey: string;
}

export interface InstallingDependencyEndingInstallState extends BaseInstallState {
  status: InstallStatus.InstallingDependencyEnding;
  dependencyPublisherKey: string;
  dependencyAddonKey: string;
  percent: number;
  entry?: string;
}

export interface DecompressingInstallState extends BaseInstallState {
  status: InstallStatus.Decompressing;
  percent: number;
  entry?: string;
}

export type InstallState =
  | GenericInstallState
  | InstallingDependencyInstallState
  | InstallingDependencyEndingInstallState
  | DecompressingInstallState;

const initialState: Record<string, InstallState> = {};

export const installStatus = createSlice({
  name: 'installStatus',
  initialState,
  reducers: {
    setInstallStatus: (state, action: TypedAction<{ addonKey: string; installState: InstallState }>) => {
      state[action.payload.addonKey] = action.payload.installState;
    },
  },
});

export const { setInstallStatus } = installStatus.actions;
export default installStatus.reducer;
