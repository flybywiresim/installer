import { createSlice } from '@reduxjs/toolkit';
import { TypedAction } from 'renderer/redux/store';
import { DownloadProgress, DownloadsState } from 'renderer/redux/types';

const initialState: DownloadsState = [];

export const downloadSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    updateDownloadProgress: (
      state,
      action: TypedAction<{ id: string; progress: DownloadProgress; module: string }>,
    ) => {
      state.forEach((download) => {
        if (download.id === action.payload.id) {
          download.progress = action.payload.progress;
          download.module = action.payload.module;
        }
      });
    },
    setDownloadModuleIndex: (state, action: TypedAction<{ id: string; moduleIndex: number }>) => {
      state.forEach((download) => {
        if (download.id === action.payload.id) {
          download.moduleIndex = action.payload.moduleIndex;
        }
      });
    },
    setDownloadInterrupted: (state, action: TypedAction<{ id: string }>) => {
      state.forEach((download) => {
        if (download.id === action.payload.id) {
          download.progress.interrupted = true;
        }
      });
    },
    clearDownloadInterrupted: (state, action: TypedAction<{ id: string }>) => {
      state.forEach((download) => {
        if (download.id === action.payload.id) {
          download.progress.interrupted = false;
        }
      });
    },
    registerNewDownload: (
      state,
      action: TypedAction<{ id: string; module: string; moduleCount: number; abortControllerID: number }>,
    ) => {
      state.push({
        id: action.payload.id,
        progress: {
          interrupted: false,
          totalPercent: 0,
        },
        module: action.payload.module,
        moduleIndex: 0,
        moduleCount: action.payload.moduleCount,
        abortControllerID: action.payload.abortControllerID,
      });
    },
    deleteDownload: (state, action: TypedAction<{ id: string }>) => {
      const index = state.findIndex((download) => download.id === action.payload.id);

      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  },
});

export const {
  updateDownloadProgress,
  setDownloadModuleIndex,
  setDownloadInterrupted,
  clearDownloadInterrupted,
  registerNewDownload,
  deleteDownload,
} = downloadSlice.actions;
export default downloadSlice.reducer;
