import React from 'react';
import logo from '../../assets/FBW-Tail.svg';
import { Container } from './styles';

export default function  Logo(): JSX.Element {
    return (
        <Container>
            <img src={logo} alt="FlyByWire Logo" id="fbw-logo"/>
        </Container>
    );
}
