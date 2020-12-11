import React from 'react';
import logo from 'renderer/assets/FBW-Tail.svg';
import fullLogo from 'renderer/assets/FBW-Logo-White.svg';
import { Container } from './styles';

export function Logo(): JSX.Element {
    return (
        <Container>
            <img src={logo} alt="FlyByWire Logo" id="fbw-logo"/>
        </Container>
    );
}

export function HomeLogo(): JSX.Element {
    return (
        <Container>
            <img src={fullLogo} alt="FlyByWire Logo" id="fbw-logo"/>
        </Container>
    );
}
