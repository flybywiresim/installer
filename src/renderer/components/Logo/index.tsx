import React from 'react';
import logo from 'renderer/assets/FBW-Tail.svg';
import fullLogo from 'renderer/assets/FBW-Logo-White.svg';
import { Container, Title } from './styles';
import { useTranslation } from "react-i18next";

export const Logo = (): JSX.Element => {
    const { t } = useTranslation();
    return (
        <Container>
            <img src={logo} alt="FlyByWire Logo" id="fbw-logo" style={{ transform: 'scale(1.35)' }}/>
            <Title>{t('TopBar.Installer')}</Title>
        </Container>
    );
};

export const HomeLogo = (): JSX.Element => (
    <Container>
        <img src={fullLogo} alt="FlyByWire Logo" id="fbw-logo"/>
    </Container>
);
