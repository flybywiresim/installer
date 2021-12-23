import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
    ChangelogState,
    DownloadsState,
    AddonAndTrackLatestVersionNamesState,
    ShowWarningModalState,
    ReleaseNotesState
} from "renderer/redux/types";
import { InstallStatus } from "renderer/components/AircraftSection";
import { AddonTrack, Configuration } from "renderer/utils/InstallerConfiguration";
import { configureStore } from '@reduxjs/toolkit';
import { combinedReducer, rootReducer } from "renderer/redux/reducer";

export type TypedAction<T> = { type: string, payload: T };
export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore({
    reducer: rootReducer,
});

if (module.hot) {
    module.hot.accept('./reducer', () => {
        const nextRootReducer = require('./reducer').default;
        store.replaceReducer(nextRootReducer);
    });
}

export type InstallerStore = {
    downloads: DownloadsState,
    changelog: ChangelogState,
    warningModal: ShowWarningModalState,
    installStatus: Record<string, InstallStatus>,
    selectedTracks: Record<string, AddonTrack>,
    installedTracks: Record<string, AddonTrack>,
    latestVersionNames: AddonAndTrackLatestVersionNamesState,
    releaseNotes: ReleaseNotesState,
    configuration: Configuration
};

export const useAppDispatch: CallableFunction = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
