import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';
import changelogReducer from 'renderer/redux/reducers/changelog.reducer';

const rootReducer = combineReducers({
    downloads: downloadsReducer,
    changelog: changelogReducer
});

export default rootReducer;
