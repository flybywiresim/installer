import React from 'react';
import { BorderOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { Button, Container } from './styles';
import InstallerUpdate from '../InstallerUpdate';

function index(): JSX.Element {
    return (
        <Container>
            <InstallerUpdate />
            <Button id="min-button"><MinusOutlined /></Button>
            <Button id="max-button"><BorderOutlined /></Button>
            <Button id="close-button" isClose><CloseOutlined /></Button>
        </Container>
    );
}

export default index;
