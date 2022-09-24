import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
    DownloadsState,
    AddonAndTrackLatestVersionNamesState,
    ReleaseNotesState,
} from "./types";
import { AddonTrack, Configuration } from "../utils/InstallerConfiguration";
import { configureStore } from '@reduxjs/toolkit';
import { combinedReducer, rootReducer } from "./reducer";
import { InstallStatus } from "../components/AddonSection/Enums";

export type TypedAction<T> = { type: string, payload: T };
export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore<RootState>({
    reducer: rootReducer,
});

// I think vite includes this by default but don't quote me on this
// if (module.hot) {
//     module.hot.accept('./reducer', () => {
//         const nextRootReducer = require('./reducer').default;
//         store.replaceReducer(nextRootReducer);
//     });
// }

export type InstallerStore = {
    downloads: DownloadsState,
    installStatus: Record<string, InstallStatus>,
    selectedTracks: Record<string, AddonTrack>,
    installedTracks: Record<string, AddonTrack>,
    latestVersionNames: AddonAndTrackLatestVersionNamesState,
    releaseNotes: ReleaseNotesState,
    configuration: Configuration,
    sentrySessionID: { sessionID: string },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
