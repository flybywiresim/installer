import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';

const initialState: { sessionID: string | undefined } = { sessionID: undefined };

export const sentrySessionIDSlice = createSlice({
  name: 'sentrySessionID',
  initialState,
  reducers: {
    setSentrySessionID: (state, action: TypedAction<string>) => {
      state.sessionID = action.payload;
    },
  },
});

export const { setSentrySessionID } = sentrySessionIDSlice.actions;
export default sentrySessionIDSlice.reducer;
