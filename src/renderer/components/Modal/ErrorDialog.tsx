import React, { FC } from 'react';
import { AlertModal } from "renderer/components/Modal/index";
import { ExclamationTriangle, Hdd, Shield } from "react-bootstrap-icons";
import { shell } from "electron";
import { FragmenterError, FragmenterErrorCode } from "@flybywiresim/fragmenter";
import { SentrySessionCard } from "renderer/components/SentrySessionCard";

const DISCORD_SUPPORT_URL = 'https://discord.com/channels/738864299392630914/1065394439608078336';

export interface ErrorDialogProps {
    error: Error;
    onAcknowledge?: () => void;
}

export const ErrorDialog: FC<ErrorDialogProps> = ({ error, onAcknowledge }) => {
    const handleOpenDiscordSupport = async () => {
        await shell.openExternal(DISCORD_SUPPORT_URL);
    };

    let fragmenterError;
    try {
        fragmenterError = FragmenterError.parseFromMessage(error.message);
    } catch (e) {
        // noop
    }

    let errorVisualisation = null;
    if (fragmenterError) {
        switch (fragmenterError.code) {
            case FragmenterErrorCode.PermissionsError:
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Shield className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">Windows permissions error</span>

                        <span className="text-2xl">Make sure the install folder has appropriate permissions.</span>
                    </ErrorVisualisationBox>
                );
                break;
            case FragmenterErrorCode.NoSpaceOnDevice:
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Hdd className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">No space left on device</span>

                        <span className="text-2xl">Try to free up space in order to install this addon.</span>
                    </ErrorVisualisationBox>
                );
                break;
            default:
                errorVisualisation = null;
                break;
        }
    }

    return (
        <AlertModal
            title={(
                <div className="flex flex-col items-center gap-y-2.5 text-utility-red fill-current mb-2.5">
                    <ExclamationTriangle size={64} />
                    <h1 className="modal-title">Error while installing</h1>
                </div>
            )}
            bodyText={(
                <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col">
                        <p>An error occurred while installing this addon.</p>

                        {errorVisualisation}

                        <pre className="h-96 bg-gray-800 p-2.5 rounded-md">{error.stack}</pre>
                    </div>

                    <div className="flex flex-col">
                        <p>Obtain support with a screenshot of this dialog on <a onClick={handleOpenDiscordSupport}>Discord</a>:</p>

                        <SentrySessionCard />
                    </div>
                </div>
            )}
            acknowledgeText="Dismiss"
            onAcknowledge={onAcknowledge}
        />
    );
};

interface ErrorVisualisationBoxProps {
    icon: JSX.Element,
}

const ErrorVisualisationBox: FC<ErrorVisualisationBoxProps> = ({ icon, children }) => (
    <div className="w-full flex items-center gap-x-7 border-2 px-7 py-3.5 mb-5 border-utility-red text-utility-red rounded-md">
        {icon}

        <div className="flex flex-col gap-y-2.5">
            {children}
        </div>
    </div>
);
