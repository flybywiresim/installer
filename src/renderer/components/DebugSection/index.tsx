import React from 'react';
import path from "path";

export const DebugSection = (): JSX.Element => {
    const sendNotification = () => {
        Notification.requestPermission().then(() => {
            console.log('Showing test notification');
            console.log(path.join(process.resourcesPath, 'extraResources', 'icon.ico'));
            new Notification('This is a test!', {
                'icon': path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
                'body': "We did something that you should know about.",
            });
        }).catch(e => console.log(e));
    };

    return (
        <div className="p-2 pl-3">
            <h1 className="text-white">Debug options</h1>
            <button className="bg-teal-light-contrast p-3 font-bold" onClick={sendNotification}>Send test notification</button>
        </div>
    );
};

export default DebugSection;
