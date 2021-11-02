import React, { useState } from 'react';
import { setupInstallPath, setupLiveriesPath } from 'renderer/actions/install-path.utils';
import { reloadLiveries } from '../AircraftSection/LiveryConversion';
import settings from "common/settings";

export const ErrorModal = (): JSX.Element => {
    const [active, setActive] = useState<boolean>(settings.get<string, boolean>('mainSettings.pathError') || settings.get<string, boolean>('mainSettings.liveriesPathError'));

    const handleClose = () => {
        setActive(false);
    };

    const reloadLiveriesIfNeeded = () => {
        if (!settings.get('mainSettings.disabledIncompatibleLiveriesWarning')) {
            reloadLiveries();
        }
    };

    const handleSelectPath = async () => {
        const path = await setupInstallPath();
        if (path) {
            settings.set('mainSettings.liveriesPath', path);
            settings.set('mainSettings.separateLiveriesPath', false);
            reloadLiveriesIfNeeded();
            handleClose();
        }
    };
    const handleSelectLiveriesPath = async () => {
        const path = await setupLiveriesPath();
        if (path) {
            settings.set('mainSettings.liveriesPath', path);
            settings.set('mainSettings.separateLiveriesPath', true);
            reloadLiveriesIfNeeded();
            handleClose();
        }
    };

    const content = (): JSX.Element => {
        if (settings.has('mainSettings.pathError')) {
            const path = settings.get('mainSettings.pathError');
            return (
                <>
                    <span className="w-3/5 text-center text-2xl">Your Community folder is set to</span>
                    <pre className="w-3/5 bg-gray-700 text-2xl text-center font-mono px-6 py-2.5 mb-0 rounded-lg">{path}</pre>
                    <span className="w-3/5 text-center text-2xl">but we couldn't find it there. Please set the correct location before we can continue.</span>
                    <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={handleSelectPath}>Select</button>
                </>
            );
        }
        if (settings.has('mainSettings.liveriesPathError')) {
            const path = settings.get('mainSettings.liveriesPathError');
            return (
                <>
                    <span className="w-3/5 text-center text-2xl">Your Liveries folder is set to</span>
                    <pre className="w-3/5 bg-gray-700 text-2xl text-center font-mono px-6 py-2.5 mb-0 rounded-lg">{path}</pre>
                    <span className="w-3/5 text-center text-2xl">but we couldn't find it there. Please set the correct location before we can continue.</span>
                    <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={handleSelectLiveriesPath}>Select</button>
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
