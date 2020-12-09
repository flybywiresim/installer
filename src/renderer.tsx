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
import 'antd/dist/antd.less';
import 'simplebar/dist/simplebar.min.css';
import './index.css';
import App from './components/App';

const win = remote.getCurrentWindow();

ReactDOM.render(<App />, document.getElementById('root'));

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
    document.getElementById('min-button').addEventListener("click", () => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    document.getElementById('close-button').addEventListener("click", () => {
        win.destroy();
    });
}
