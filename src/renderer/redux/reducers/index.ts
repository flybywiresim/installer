import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';
import changelogReducer from 'renderer/redux/reducers/changelog.reducer';
import warningModalReducer from 'renderer/redux/reducers/warningModal.reducer';
import installStatusReducer from 'renderer/redux/reducers/installStatus.reducer';
import selectedTrackReducer from 'renderer/redux/reducers/selectedTrack.reducer';
import installedTrackReducer from 'renderer/redux/reducers/installedTrack.reducer';
import latestVersionNamesReducer from 'renderer/redux/reducers/latestVersionNames.reducer';
import liveriesReducer from 'renderer/redux/reducers/liveries.reducer';
import flatCombineReducers from 'flat-combine-reducers'

const rootReducer = combineReducers({
    downloads: downloadsReducer,
    addons: flatCombineReducers(
        installStatusReducer,
        ),
    changelog: changelogReducer,
    warningModal: warningModalReducer,
    selectedTrack: selectedTrackReducer,
    installedTrack: installedTrackReducer,
    latestVersionNames: latestVersionNamesReducer,
    liveries: liveriesReducer
});

export default rootReducer;
