import React from 'react';
// @ts-ignore: Disabling ts check here because this package has no @types
import { Offline } from "react-detect-offline";
import NoInternetSVG from 'renderer/assets/no-internet.svg';
import { Container, Modal } from './styles';

export default function (): JSX.Element {
    return (
        <>
            <Offline>
                <Container>
                    <Modal >
                        <img alt={"It seems you're offline"} src={NoInternetSVG} />
                        <p>It seems you're offline</p>
                    </Modal>
                </Container>
            </Offline>
        </>
    );
}
