import { createStore } from 'redux';
import rootReducer from './reducers';

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(rootReducer, composeEnhancers);

if (module.hot) {
    module.hot.accept('./reducers', () => {
        const nextRootReducer = require('./reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

export default store;
