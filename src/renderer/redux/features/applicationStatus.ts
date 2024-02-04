import { createSlice } from '@reduxjs/toolkit';
import { ApplicationStatus } from 'renderer/components/AddonSection/Enums';
import { TypedAction } from 'renderer/redux/store';

const initialState: Record<string, ApplicationStatus> = {};

export const applicationStatusSlice = createSlice({
  name: 'applicationStatus',
  initialState,
  reducers: {
    setApplicationStatus: (
      state,
      action: TypedAction<{ applicationName: string; applicationStatus: ApplicationStatus }>,
    ) => {
      state[action.payload.applicationName] = action.payload.applicationStatus;
    },
  },
});

export const { setApplicationStatus } = applicationStatusSlice.actions;
export default applicationStatusSlice.reducer;
