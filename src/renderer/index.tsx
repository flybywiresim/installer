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
import App, { fetchLatestVersionNames } from 'renderer/components/App';
import { Configuration, InstallerConfiguration } from 'renderer/utils/InstallerConfiguration';
import { ipcRenderer } from "electron";

import 'antd/dist/antd.less';
import 'simplebar/dist/simplebar.min.css';
import { Directories } from "renderer/utils/Directories";
import channels from "common/channels";
import { MemoryRouter } from 'react-router-dom';
import { store } from "renderer/redux/store";
import { setConfiguration } from './redux/features/configuration';
import { GitVersions } from "@flybywiresim/api-client";
import { addReleases } from "renderer/redux/features/releaseNotes";
import { ModalProvider } from "renderer/components/Modal";

import './index.scss';

// Obtain configuration and use it
InstallerConfiguration.obtain().then((config: Configuration) => {
    store.dispatch(setConfiguration({ configuration: config }));

    for (const publisher of config.publishers) {
        for (const addon of publisher.addons) {
            if (addon.repoOwner && addon.repoName) {
                GitVersions.getReleases(addon.repoOwner, addon.repoName, false, 0, 5).then(res => {
                    const content = res.map(release => ({
                        name: release.name,
                        publishedAt: release.publishedAt.getTime(),
                        htmlUrl: release.htmlUrl,
                        body: release.body,
                    }));

                    if (content.length) {
                        store.dispatch(addReleases({ key: addon.key, releases: content }));
                    } else {
                        store.dispatch(addReleases({ key: addon.key, releases: [] }));
                    }
                });
            } else {
                store.dispatch(addReleases({ key: addon.key, releases: [] }));
            }

            fetchLatestVersionNames(addon);
        }
    }

    console.log(config);
    Directories.removeAllTemp();
    ReactDOM.render(
        <Provider store={store}>
            <MemoryRouter>
                <ModalProvider>
                    <App />
                </ModalProvider>
            </MemoryRouter>
        </Provider>,
        document.getElementById('root'),
    );
}).catch((error: Error) => {
    ReactDOM.render(
        <div className="h-screen flex flex-col gap-y-5 justify-center items-center bg-navy text-gray-100">
            <span className="text-5xl font-semibold">Something went very wrong.</span>
            <span className="w-3/5 text-center text-2xl">We could not configure your installer. Please seek support on the Discord #support channel or on GitHub and provide a screenshot of the following information:</span>
            <pre className="w-3/5 bg-gray-700 text-2xl font-mono px-6 py-2.5 mb-0 rounded-lg">{error.stack}</pre>
            <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={() => ipcRenderer.send(channels.window.close)}>Close the Installer</button>
        </div>,
        document.getElementById('root'),
    );
});
