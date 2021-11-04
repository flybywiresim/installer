import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';
import changelogReducer from 'renderer/redux/reducers/changelog.reducer';
import warningModalReducer from 'renderer/redux/reducers/warningModal.reducer';
import installStatusReducer from 'renderer/redux/reducers/installStatus.reducer';
import selectedTrackReducer from 'renderer/redux/reducers/selectedTrack.reducer';
import installedTrackReducer from 'renderer/redux/reducers/installedTrack.reducer';
import latestVersionNamesReducer from 'renderer/redux/reducers/latestVersionNames.reducer';
import liveriesReducer from 'renderer/redux/reducers/liveries.reducer';

const rootReducer = combineReducers({
    downloads: downloadsReducer,
    changelog: changelogReducer,
    warningModal: warningModalReducer,
    selectedTracks: selectedTrackReducer,
    installedTracks: installedTrackReducer,
    installStatus: installStatusReducer,
    latestVersionNames: latestVersionNamesReducer,
    liveries: liveriesReducer
});

export default rootReducer;
