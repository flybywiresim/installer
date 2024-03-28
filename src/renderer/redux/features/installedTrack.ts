import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';
import { AddonTrack } from 'renderer/utils/InstallerConfiguration';

const initialState: Record<string, AddonTrack> = {};

export const installedTrackSlice = createSlice({
  name: 'installedTrack',
  initialState,
  reducers: {
    setInstalledTrack: (state, action: TypedAction<{ addonKey: string; installedTrack: AddonTrack }>) => {
      state[action.payload.addonKey] = action.payload.installedTrack;
    },
  },
});

export const { setInstalledTrack } = installedTrackSlice.actions;
export default installedTrackSlice.reducer;
