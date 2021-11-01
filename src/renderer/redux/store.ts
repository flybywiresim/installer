import { createStore } from 'redux';
import rootReducer from './reducers';
import {
    ChangelogState,
    DownloadsState,
    AddonAndTrackLatestVersionNamesState,
    ShowWarningModalState,
    AddonStates
} from "renderer/redux/types";
import { InstallStatus } from "renderer/components/AircraftSection";
import { AddonTrack } from "renderer/utils/InstallerConfiguration";
import { LiveriesState } from "renderer/redux/reducers/liveries.reducer";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
    addons: AddonStates,
    warningModal: ShowWarningModalState,
    installStatus: InstallStatus,
    selectedTrack: AddonTrack,
    installedTrack: AddonTrack,
    latestVersionNames: AddonAndTrackLatestVersionNamesState,
    liveries: LiveriesState,
};

export default store;
