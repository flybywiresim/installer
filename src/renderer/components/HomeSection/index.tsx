import React from 'react';
import { HomeLogo } from 'renderer/components/Logo';
// import { Container, LogoAndText, Images, DescAndImages, Image } from './styles';
import { Container, LogoAndText, DescAndImages } from './styles';

function index(): JSX.Element {
    return (
        <Container>
            <LogoAndText>
                <HomeLogo />
            </LogoAndText>
            <DescAndImages>
                <p>FlyByWire Simulations is a community-driven group currently focused on creating two freeware aircraft,
                    the A32NX  (a modification of the default A320neo in MSFS), and the A380.</p>
                {/* <Images>
                    <Image />
                    <Image />
                    <Image />
                </Images> */}
            </DescAndImages>
        </Container>
    );
}

export default index;
