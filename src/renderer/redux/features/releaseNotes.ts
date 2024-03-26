import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';
import { ReleaseData } from 'renderer/redux/types';

const initialState: Record<string, ReleaseData[]> = {};

export const releaseNotesSlice = createSlice({
  name: 'releaseNotes',
  initialState,
  reducers: {
    addReleases: (state, action: TypedAction<{ key: string; releases: ReleaseData[] }>) => {
      if (!state[action.payload.key]) {
        state[action.payload.key] = action.payload.releases;
      } else {
        state[action.payload.key].push(...action.payload.releases);
      }
    },
  },
});

export const { addReleases } = releaseNotesSlice.actions;
export default releaseNotesSlice.reducer;
