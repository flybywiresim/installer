import { combineReducers, createStore } from 'redux';
import downloadsReducer from 'renderer/redux/reducers/downloads.reducer'

const store = combineReducers({
  downloads: downloadsReducer
})

export default createStore(store);