import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';
import changelogReducer from 'renderer/redux/reducers/changelog.reducer';
import warningReducer from 'renderer/redux/reducers/warning.reducer';

const rootReducer = combineReducers({
    downloads: downloadsReducer,
    changelog: changelogReducer,
    warning: warningReducer
});

export default rootReducer;
