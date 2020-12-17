import { combineReducers } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer';

const rootReducer = combineReducers({
    downloads: downloadsReducer
});

export default rootReducer;
