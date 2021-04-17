import React, { useState } from 'react';
import Store from "electron-store";
import { Close } from './styles';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { reloadLiveries } from '../AircraftSection/LiveryConversion';

const settings = new Store();

export const ErrorModal = (): JSX.Element => {
    const [active, setActive] = useState<boolean>(settings.has('mainSettings.pathError'));

    const handleClose = () => {
        setActive(false);
    };

    const handleSelectPath = async () => {
        const path = await setupInstallPath();
        if (path) {
            settings.set('mainSettings.liveriesPath', path);
            settings.set('mainSettings.separateLiveriesPath', false);
            if (!settings.get('mainSettings.disabledIncompatibleLiveriesWarning')) {
                reloadLiveries();
            }
            handleClose();
            settings.delete('mainSettings.pathError');
        }
    };

    const content = (): JSX.Element => {
        if (settings.has('mainSettings.pathError')) {
            return (
                <div>
                    <p>
                        Your current 'Community' path could not be resolved. <br/> Please select it manually:
                    </p>
                    <button className="m-auto rounded text-gray-50 py-1 px-6 bg-red hover:bg-red-darker block text-xl font-semibold" onClick={handleSelectPath}>Select</button>
                </div>
            );
        }
        return <></>;
    };

    if (active) {
        return (
            <div className=" flex justify-center items-center fixed z-10 left-0 top-0 w-screen h-screen overflow-auto bg-black bg-opacity-40">
                <div className="relative w-520px bg-navy-lighter flex flex-col rounded-lg text-teal-50 p-5">
                    <Close className="absolute right-5 text-xl h-8 w-8" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </Close>
                    <div className="text-3xl text-gray-50 mb-5">Error!</div>
                    {content()}
                </div>
            </div>
        );
    }
    return (<></>);
};
