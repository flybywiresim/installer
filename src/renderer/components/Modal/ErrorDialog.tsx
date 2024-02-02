import React, { FC, useState } from 'react';
import { AlertModal } from "renderer/components/Modal/index";
import { Clipboard, ClipboardCheck, ExclamationTriangle, Hdd, Shield } from "react-bootstrap-icons";
import { clipboard, shell } from "electron";
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
            case FragmenterErrorCode.Null:
                break;
            case FragmenterErrorCode.PermissionsError:
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Shield className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">Windows permissions error</span>
                        <span className="text-2xl">Make sure the install folder has appropriate permissions.</span>
                    </ErrorVisualisationBox>
                );
                break;
            case FragmenterErrorCode.ResourcesBusy:
                break;
            case FragmenterErrorCode.NoSpaceOnDevice:
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Hdd className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">No space left on device</span>
                        <span className="text-2xl">Try to free up space in order to install this addon.</span>
                    </ErrorVisualisationBox>
                );
                break;
            case FragmenterErrorCode.NetworkError: // fallthrough
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Shield className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">Network error</span>
                        <span className="text-2xl">Try again or use a VPN when connection problems persist.</span>
                    </ErrorVisualisationBox>
                );
                break;
            case FragmenterErrorCode.MaxModuleRetries: // fallthrough
                errorVisualisation = (
                    <ErrorVisualisationBox icon={<Shield className="text-utility-red" size={36} />}>
                        <span className="text-4xl font-bold font-manrope">Maximum number of download retries reached</span>
                        <span
                            className="text-2xl">Try again or check your network settings. Use a VPN when connection problems persist.</span>
                    </ErrorVisualisationBox>
                );
                break;
            case FragmenterErrorCode.FileNotFound: // fallthrough
            case FragmenterErrorCode.DirectoryNotEmpty: // fallthrough
            case FragmenterErrorCode.NotADirectory: // fallthrough
            case FragmenterErrorCode.ModuleJsonInvalid: // fallthrough
            case FragmenterErrorCode.ModuleCrcMismatch: // fallthrough
            case FragmenterErrorCode.UserAborted: // fallthrough
            case FragmenterErrorCode.CorruptedZipFile: // fallthrough
            case FragmenterErrorCode.Unknown: // fallthrough
            default:
                errorVisualisation = null;
                break;
        }
    }

    // Error stack to clipboard handling
    const [showCopied, setShowCopied] = useState(false);
    const handleCopy = () => {
        clipboard.writeText(error.stack, 'clipboard');
        setShowCopied(true);
        setTimeout(() => {
            setShowCopied(false);
        }, 1_500);
    };

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
                        <p>Obtain support on <a onClick={handleOpenDiscordSupport}>Discord</a> and provide the error message and on request
                            the sentry code:</p>
                        <div
                            className="relative w-full flex justify-center items-center border-2 border-gray-800 text-3xl text-center p-3.5 rounded-md">
                            <span className="font-mono">Copy error message to clipboard:</span>
                            <div className="absolute right-3">
                                {showCopied ? (
                                    <span className="flex items-center gap-x-2.5 text-utility-green">
                                        <span className="text-3xl font-medium">Copied</span>
                                        <ClipboardCheck className="transition-colors duration-200 cursor-pointer" size={24}
                                            onClick={handleCopy} />
                                    </span>
                                ) : (
                                    <Clipboard className="text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                                        size={24} onClick={handleCopy} />
                                )}
                            </div>
                        </div>
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
