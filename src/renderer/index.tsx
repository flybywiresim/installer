/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'renderer/components/App';
import store from 'renderer/redux/store';
import { Configuration, InstallerConfiguration } from 'renderer/utils/InstallerConfiguration';
import { ipcRenderer } from "electron";

import './index.css';
import 'antd/dist/antd.less';
import 'simplebar/dist/simplebar.min.css';
import { LiveryConversion } from "renderer/utils/LiveryConversion";
import * as actionTypes from "renderer/redux/actionTypes";
import { LiveryAction } from "renderer/redux/types";
import { LiveryState } from "renderer/redux/reducers/liveries.reducer";
import { Directories } from "renderer/utils/Directories";
import settings from "common/settings";
import channels from "common/channels";

// Check for A32NX incompatible liveries if not disabled

const disableLiveryWarningSetting = settings.get('mainSettings.disabledIncompatibleLiveriesWarning');

if (!disableLiveryWarningSetting) {
    LiveryConversion.getIncompatibleLiveries().then((liveries) => {
        liveries.forEach((livery) => store.dispatch<LiveryAction>({
            type: actionTypes.SET_LIVERY_STATE,
            payload: {
                livery,
                state: LiveryState.DETECTED,
            },
        }));
    });
}

// Obtain configuration and use it

InstallerConfiguration.obtain().then((config: Configuration) => {
    console.log(config);
    Directories.removeAllTemp();

    ReactDOM.render(
        <Provider store={store}>
            <App configuration={config} />
        </Provider>,
        document.getElementById('root')
    );
}).catch((error: Error) => {
    ReactDOM.render(
        <div className="h-screen flex flex-col gap-y-5 justify-center items-center bg-navy text-gray-100">
            <span className="text-5xl font-semibold">Something went very wrong.</span>
            <span className="w-3/5 text-center text-2xl">We could not configure your installer. Please seek support on the Discord #support channel or on GitHub and provide a screenshot of the following information:</span>
            <pre className="w-3/5 bg-gray-700 text-2xl font-mono px-6 py-2.5 mb-0 rounded-lg">{error.stack}</pre>
            <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={() => ipcRenderer.send(channels.window.close)}>Close the Installer</button>
        </div>,
        document.getElementById('root')
    );
});

// When document has loaded, initialize
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

function handleWindowControls() {
    document.getElementById('min-button')?.addEventListener("click", () => {
        ipcRenderer.send(channels.window.minimize);
    });

    document.getElementById('max-button')?.addEventListener("click", () => {
        ipcRenderer.send(channels.window.maximize);

    });

    document.getElementById('close-button')?.addEventListener("click", () => {
        Directories.removeAllTemp();
        ipcRenderer.send(channels.window.close);
    });
}
