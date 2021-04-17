import React, { useState } from 'react';
import Store from "electron-store";
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
                <>
                    <span className="w-3/5 text-center text-2xl">We could not resolve your current 'Community' path. Please select it manually:</span>
                    <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={handleSelectPath}>Select</button>
                </>
            );
        }
        return <></>;
    };

    if (active) {
        return (
            <div className="h-screen w-screen left-0 top-0 fixed flex flex-col gap-y-5 justify-center items-center bg-navy text-gray-100 z-50">
                <span className="text-5xl font-semibold">Something went wrong.</span>
                {content()}
            </div>
        );
    }
    return (<></>);
};
