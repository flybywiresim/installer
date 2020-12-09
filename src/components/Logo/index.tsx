import React from 'react';
import logo from '../../assets/FBW-Logo-White.svg';
import { Container } from './styles';

export default function Logo(): JSX.Element {
    return (
        <Container>
            <img src={logo} alt="FlyByWire Logo" id="fbw-logo"/>
        </Container>
    );
}
