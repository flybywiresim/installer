import React, { useState } from 'react';
import { setupInstallPath } from '../../actions/install-path.utils';
// import settings from "../../common/settings";
import { Directories } from "../../utils/Directories";
import * as fs from "fs";

export const ErrorModal = (): JSX.Element => {
    const [communityError, setCommunityError] = useState<boolean>(!fs.existsSync(Directories.community()) || Directories.community() === 'C:\\');
    const [linuxError, setLinuxError] = useState<boolean>(Directories.community() === 'linux');

    const handleClose = () => {
        setCommunityError(false);
        setLinuxError(false);
    };

    const handleSelectPath = async () => {
        const path = await setupInstallPath();
        if (path) {
            // settings.set('mainSettings.liveriesPath', path);
            // settings.set('mainSettings.separateLiveriesPath', false);
            handleClose();
        }
    };

    const content = (): JSX.Element => {
        // Linux's error goes first because it may interfere with the other dir checkers
        if (linuxError) {
            return (
                <>
                    <span className="w-3/5 text-center text-2xl">Seems like you're using Linux</span>
                    <span className="w-3/5 text-center text-2xl">We're unable to autodetect your install currently. Please set the correct location before we can continue.</span>
                    <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={handleSelectPath}>Select</button>
                </>
            );
        }
        if (communityError && (Directories.community() !== 'linux')) {
            return (
                <>
                    <span className="w-3/5 text-center text-2xl">Your Community folder is set to</span>
                    <pre className="w-3/5 bg-gray-700 text-2xl text-center font-mono px-6 py-2.5 mb-0 rounded-lg">{Directories.community()}</pre>
                    <span className="w-3/5 text-center text-2xl">but we couldn't find it there. Please set the correct location before we can continue.</span>
                    <button className="bg-navy-lightest hover:bg-navy-lighter px-5 py-2 text-lg font-semibold rounded-lg" onClick={handleSelectPath}>Select</button>
                </>
            );
        }
        return <></>;
    };

    if (communityError || linuxError) {
        return (
            <div className="h-screen w-screen left-0 top-0 fixed flex flex-col gap-y-5 justify-center items-center bg-navy text-gray-100 z-50">
                <span className="text-5xl font-semibold">Something went wrong.</span>
                {content()}
            </div>
        );
    }
    return (<></>);
};
