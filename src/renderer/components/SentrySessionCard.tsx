import React, { FC, useState } from "react";
import { useAppSelector } from "renderer/redux/store";
import { Clipboard, ClipboardCheck } from "react-bootstrap-icons";
import { clipboard } from "electron";

export const SentrySessionCard: FC = () => {
    const sessionID = useAppSelector((state) => state.sentrySessionID.sessionID);

    const [showCopied, setShowCopied] = useState(false);

    const handleCopy = () => {
        clipboard.writeText(sessionID, 'clipboard');

        setShowCopied(true);

        setTimeout(() => {
            setShowCopied(false);
        }, 1_500);
    };

    return (
        <div className="relative w-full flex justify-center items-center border-2 border-gray-800 text-2xl text-center p-3.5 rounded-md">
            {showCopied ? (
                <>
                    <span className="font-mono text-utility-green">Copied!</span>
                    <div className="absolute right-3">
                        <span className="flex items-center gap-x-2.5">
                            <ClipboardCheck className="transition-colors duration-200 cursor-pointer" size={24}
                                onClick={handleCopy} />
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <span className="font-mono">Copy Sentry Code to clipboard: {sessionID}</span>
                    <div className="absolute right-3">
                        <span className="flex items-center gap-x-2.5">
                            <Clipboard
                                className="text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                                size={24} onClick={handleCopy} />
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};
