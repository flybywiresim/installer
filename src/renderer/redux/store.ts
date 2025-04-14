import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { DownloadsState, AddonAndTrackLatestVersionNamesState, ReleaseNotesState } from 'renderer/redux/types';
import { AddonTrack, Configuration } from 'renderer/utils/InstallerConfiguration';
import { configureStore } from '@reduxjs/toolkit';
import { combinedReducer, rootReducer } from 'renderer/redux/reducer';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';

export type TypedAction<T> = { type: string; payload: T };
export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore<RootState>({
  reducer: rootReducer,
});

export type InstallerStore = {
  downloads: DownloadsState;
  installStatus: Record<string, InstallStatus>;
  selectedTracks: Record<string, AddonTrack>;
  installedTracks: Record<string, AddonTrack>;
  latestVersionNames: AddonAndTrackLatestVersionNamesState;
  releaseNotes: ReleaseNotesState;
  configuration: Configuration;
  sentrySessionID: { sessionID: string };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
