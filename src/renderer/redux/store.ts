import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);

if (module.hot) {
    module.hot.accept('./reducers', () => {
        const nextRootReducer = require('./reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

export default store;
