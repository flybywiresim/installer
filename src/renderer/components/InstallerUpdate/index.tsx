import React, { useEffect, useState } from "react";
import { Container, UpdateText } from "renderer/components/InstallerUpdate/styles";
import { ipcRenderer } from "electron";
import * as path from 'path';
import i18n from "i18next";

function index(): JSX.Element {
    const [buttonText, setButtonText] = useState<string>('');
    const [updateNeeded, setUpdateNeeded] = useState<boolean>(false);

    useEffect(() => {
        ipcRenderer.on('update-error', (event, args) => {
            console.error(i18n.t('InstallerUpdate.ErrorUpdate'), args);
        });
        ipcRenderer.on('update-available', () => {
            console.log('Update available');
            setUpdateNeeded(true);
            setButtonText(i18n.t('InstallerUpdate.DownloadingUpdate'));
        });
        ipcRenderer.on('update-downloaded', (event, args) => {
            console.log('Update downloaded', args);
            setButtonText(i18n.t('InstallerUpdate.RestartToUpdate'));
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
