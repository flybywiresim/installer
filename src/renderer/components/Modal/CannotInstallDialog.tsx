import React, { FC } from "react";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { PromptModal } from "renderer/components/Modal/index";
import { Window } from "react-bootstrap-icons";
import { useAddonExternalApps } from "renderer/utils/ExternalAppsUI";

export interface CannotInstallDialogProps {
    addon: Addon,
    publisher: Publisher,
    onCancel?: () => void,
    onConfirm?: () => void,
}

export const CannotInstallDialog: FC<CannotInstallDialogProps> = ({ addon, publisher, onCancel, onConfirm }) => {
    const [runningExternalApps, disallowedRunningExternalApps] = useAddonExternalApps(addon, publisher);

    return (
        <PromptModal
            title="Wait a minute"
            bodyText={(
                <>
                    <p>
                        You cannot install or update
                        {' '}
                        <b>{addon.name}</b>
                        {' '}
                        while the following external apps are running:
                    </p>

                    <div>
                        {disallowedRunningExternalApps.map((app) => {
                            const appIsRunning = runningExternalApps.includes(app);

                            const borderColor = appIsRunning ? 'border-utility-amber' : 'border-utility-green';
                            const textColor = appIsRunning ? 'text-utility-amber' : 'text-utility-green';

                            return (
                                <div className={`flex items-center gap-x-7 bg-navy border-t-4 ${borderColor} px-7 py-6 rounded-md my-6`}>
                                    <Window size={24} className={`${textColor} fill-current`} />

                                    <div className="w-full flex justify-between items-center">
                                        <span className="flex flex-col gap-y-2">
                                            {/*<span className="text-3xl font-medium">{publisher.name}</span> /!* TODO when we support external apps in the global scope or other publishers, change this *!/*/}
                                            <span className="text-4xl font-medium">{app.prettyName}</span>
                                        </span>

                                        <span
                                            className={`flex justify-between items-center gap-x-5 ${textColor}`}>
                                            {/*<Activity size={32} className={`fill-current`}/>*/}
                                            <span className="text-3xl font-bold">{appIsRunning ? 'Running' : 'Closed'}</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p>Close all apps above to continue.</p>

                    <hr/>
                </>
            )}
            onCancel={onCancel}
            confirmText="Continue"
            confirmEnabled={runningExternalApps.length === 0}
            onConfirm={onConfirm}
        />
    );
};
