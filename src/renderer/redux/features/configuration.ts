import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from '../store';
import { Configuration } from 'renderer/utils/InstallerConfiguration';

const initialState: Configuration = { version: 0, publishers: [] };

export const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setConfiguration: (state, action: TypedAction<{ configuration: Configuration }>) => {
      state.publishers = action.payload.configuration.publishers;
    },
  },
});

export const { setConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer;
