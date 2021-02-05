import React from 'react';
import { BorderOutlined, CloseOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Container } from './styles';
import InstallerUpdate from '../InstallerUpdate';
import { shell } from 'electron';

function index(): JSX.Element {

    const openGithub = () => shell.openExternal("https://github.com/flybywiresim/a32nx/issues/new/choose");

    return (
        <Container>
            <InstallerUpdate />
            <Button onClick={openGithub} ><ExclamationCircleOutlined /></Button>
            <Button id="min-button"><MinusOutlined /></Button>
            <Button id="max-button"><BorderOutlined /></Button>
            <Button id="close-button" isClose><CloseOutlined /></Button>
        </Container>
    );
}

export default index;
