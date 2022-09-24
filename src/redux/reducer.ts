import { AnyAction, combineReducers, Reducer } from "redux";
import downloadsReducer from "../redux/features/downloads";
import installStatusReducer from "../redux/features/installStatus";
import installedTrackReducer from "../redux/features/installedTrack";
import latestVersionNamesReducer from "../redux/features/latestVersionNames";
import selectedTrackReducer from "../redux/features/selectedTrack";
import releaseNotesReducer from "../redux/features/releaseNotes";
import configurationReducer from "../redux/features/configuration";
import applicationStatusReducer from "../redux/features/applicationStatus";
import sentrySessionIDReducer from "../redux/features/sentrySessionID";

import { RootState } from "./store";

export const combinedReducer = combineReducers({
    downloads: downloadsReducer,
    installStatus: installStatusReducer,
    installedTracks: installedTrackReducer,
    latestVersionNames: latestVersionNamesReducer,
    selectedTracks: selectedTrackReducer,
    releaseNotes: releaseNotesReducer,
    configuration: configurationReducer,
    applicationStatus: applicationStatusReducer,
    sentrySessionID: sentrySessionIDReducer,
});

export const rootReducer: Reducer = (state: RootState, action: AnyAction) => combinedReducer(state, action);
