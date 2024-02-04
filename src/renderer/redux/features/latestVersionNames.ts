import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';
import { AddonAndTrackLatestVersionNamesState } from 'renderer/redux/types';
import { ReleaseInfo } from 'renderer/utils/AddonData';

const initialState: AddonAndTrackLatestVersionNamesState = {};

export const latestVersionNamesSlice = createSlice({
  name: 'latestVersionNames',
  initialState,
  reducers: {
    setAddonAndTrackLatestReleaseInfo: (
      state,
      action: TypedAction<{ addonKey: string; trackKey: string; info: ReleaseInfo }>,
    ) => {
      if (!state[action.payload.addonKey]) {
        state[action.payload.addonKey] = {};
      }

      state[action.payload.addonKey][action.payload.trackKey] = action.payload.info;
    },
  },
});

export const { setAddonAndTrackLatestReleaseInfo } = latestVersionNamesSlice.actions;
export default latestVersionNamesSlice.reducer;
