import React from 'react';
import { Logo } from 'renderer/components/Logo';
import { Container } from './styles';

function index(): JSX.Element {
    return (
        <Container>
            <Logo />
        </Container>
    );
}

export default index;
