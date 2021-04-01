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
import { remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'renderer/components/App';
import store from 'renderer/redux/store';
import Store from 'electron-store';
import { InstallerConfiguration, Configuration } from 'renderer/utils/InstallerConfiguration';

import './index.css';
import 'antd/dist/antd.less';

const settings = new Store;

const win = remote.getCurrentWindow();

// @ts-ignore
window.React2 = React;
// @ts-ignore
console.log(window.React1 === window.React2);

InstallerConfiguration.obtain().then((config: Configuration) => {
    console.log(config);

    ReactDOM.render(
        <Provider store={store}>
            <App configuration={config} />
        </Provider>,
        document.body
    );
}).catch((error: Error) => {
    ReactDOM.render(
        <div className="h-screen flex flex-col gap-y-5 justify-center items-center bg-navy text-gray-100">
            <span className="text-5xl font-semibold">Something went very wrong.</span>
            <span className="w-3/5 text-center text-2xl">We could not configure your installer. Please seek support on the Discord #help channel or on GitHub and provide a screenshot of the following information:</span>
            <pre className="w-3/5 bg-gray-700 text-2xl font-mono px-6 py-2.5 mb-0 rounded-lg">{error.stack}</pre>
            <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={() => remote.app.quit()}>Close the Installer</button>
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

window.onbeforeunload = () => {
    win.removeAllListeners();
};

function handleWindowControls() {
    document.getElementById('min-button')?.addEventListener("click", () => {
        win.minimize();
    });

    document.getElementById('max-button')?.addEventListener("click", () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    document.getElementById('close-button')?.addEventListener("click", () => {
        settings.set('cache.main.maximized', win.isMaximized());
        const winSize = win.getSize();

        settings.set('cache.main.lastWindowX', winSize[0]);
        settings.set('cache.main.lastWindowY', winSize[1]);

        win.destroy();
    });
}
