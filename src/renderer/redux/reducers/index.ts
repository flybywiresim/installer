import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';
import changelogReducer from 'renderer/redux/reducers/changelog.reducer';
import warningModalReducer from 'renderer/redux/reducers/warningModal.reducer';

const rootReducer = combineReducers({
    downloads: downloadsReducer,
    changelog: changelogReducer,
    warningModal: warningModalReducer,
});

export default rootReducer;
