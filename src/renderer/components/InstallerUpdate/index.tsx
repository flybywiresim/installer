import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import * as path from 'path';
import channels from "common/channels";

function index(): JSX.Element {
    const [buttonText, setButtonText] = useState('');
    const [updateNeeded, setUpdateNeeded] = useState(false);

    useEffect(() => {
        ipcRenderer.on(channels.update.error, (_, args) => {
            console.error('Update error', args);
        });
        ipcRenderer.on(channels.update.available, () => {
            console.log('Update available');
            setUpdateNeeded(true);
            setButtonText('Downloading update');
        });
        ipcRenderer.on(channels.update.downloaded, (_, args) => {
            console.log('Update downloaded', args);
            setButtonText('Restart to update');
            Notification.requestPermission().then(function () {
                console.log('Showing Update notification');
                new Notification('Restart to update!', {
                    'icon': path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
                    'body': "An update to the installer has been downloaded",
                });
            }).catch(e => console.log(e));
        });
    }, []);

    return (
        <div
            className="flex items-center place-self-start justify-center px-4 h-full bg-yellow-500 hover:bg-yellow-600 z-50 cursor-pointer transition duration-200"
            hidden={!updateNeeded}
            onClick={() => ipcRenderer.send('restart')}
        >
            <div className="text-white font-semibold text-lg">{buttonText}Restart to Update</div>
        </div>
    );
}

export default index;
