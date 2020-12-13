import React from 'react';
import { Logo } from 'renderer/components/Logo';
import { Container, Title } from './styles';

function index(): JSX.Element {
    return (
        <Container>
            <Logo />
            <Title>FlyByWire Installer</Title>
        </Container>
    );
}

export default index;
