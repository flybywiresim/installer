import { AnyAction, combineReducers, Reducer } from "redux";
import changelogReducer from "renderer/redux/features/changelog";
import downloadsReducer from "renderer/redux/features/downloads";
import installStatusReducer from "renderer/redux/features/installStatus";
import installedTrackReducer from "renderer/redux/features/installedTrack";
import latestVersionNamesReducer from "renderer/redux/features/latestVersionNames";
import selectedTrackReducer from "renderer/redux/features/selectedTrack";
import warningModalReducer from "renderer/redux/features/warningModal";
import releaseNotesReducer from "renderer/redux/features/releaseNotes";
import configurationReducer from "renderer/redux/features/configuration";

import { RootState } from "renderer/redux/store";

export const combinedReducer = combineReducers({
    changelog: changelogReducer,
    downloads: downloadsReducer,
    installStatus: installStatusReducer,
    installedTracks: installedTrackReducer,
    latestVersionNames: latestVersionNamesReducer,
    selectedTracks: selectedTrackReducer,
    warningModal: warningModalReducer,
    releaseNotes: releaseNotesReducer,
    configuration: configurationReducer,
});

export const rootReducer: Reducer = (state: RootState, action: AnyAction) => combinedReducer(state, action);
