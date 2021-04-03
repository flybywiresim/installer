import { createStore } from 'redux';
import rootReducer from './reducers';
import {
    ChangelogState,
    DownloadsState,
    ModAndTrackLatestVersionNamesState,
    ShowWarningModalState
} from "renderer/redux/types";
import { InstallStatus } from "renderer/components/AircraftSection";
import { ModTrack } from "renderer/utils/InstallerConfiguration";
import { LiveriesState } from "renderer/redux/reducers/liveries.reducer";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(rootReducer, composeEnhancers);

if (module.hot) {
    module.hot.accept('./reducers', () => {
        const nextRootReducer = require('./reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

export type InstallerStore = {
    downloads: DownloadsState,
    changelog: ChangelogState,
    warningModal: ShowWarningModalState,
    installStatus: InstallStatus,
    selectedTrack: ModTrack,
    installedTrack: ModTrack,
    latestVersionNames: ModAndTrackLatestVersionNamesState,
    liveries: LiveriesState,
};

export default store;
