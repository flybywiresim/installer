import React, { useEffect, useState } from "react";
import { Container, UpdateText } from "renderer/components/InstallerUpdate/styles";
import { ipcRenderer } from "electron";

function index(): JSX.Element {
    const [buttonText, setButtonText] = useState<string>('');
    const [updateNeeded, setUpdateNeeded] = useState<boolean>(false);

    useEffect(() => {
        ipcRenderer.on('update-error', (event, args) => {
            console.error('Update error', args);
        });
        ipcRenderer.on('update-available', () => {
            console.log('Update available');
            setUpdateNeeded(true);
            setButtonText('Downloading update');
        });
        ipcRenderer.on('update-downloaded', (event, args) => {
            console.log('Update downloaded', args);
            setButtonText('Restart to update');
        });
    }, []);

    return (
        <Container hidden={!updateNeeded}>
            <UpdateText>{buttonText}</UpdateText>
        </Container>
    );
}

export default index;
