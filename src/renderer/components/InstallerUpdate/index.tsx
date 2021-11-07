import React, { useEffect, useState } from "react";
import { Container, UpdateText } from "renderer/components/InstallerUpdate/styles";
import { ipcRenderer } from "electron";
import * as path from 'path';
import channels from "common/channels";

function index(): JSX.Element {
    const [buttonText, setButtonText] = useState<string>('');
    const [updateNeeded, setUpdateNeeded] = useState<boolean>(false);

    useEffect(() => {
        ipcRenderer.on(channels.update.error, (event, args) => {
            console.error('Update error', args);
        });
        ipcRenderer.on(channels.update.available, () => {
            console.log('Update available');
            setUpdateNeeded(true);
            setButtonText('Downloading update');
        });
        ipcRenderer.on(channels.update.downloaded, (event, args) => {
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
        <Container hidden={!updateNeeded}>
            <UpdateText>{buttonText}</UpdateText>
        </Container>
    );
}

export default index;
