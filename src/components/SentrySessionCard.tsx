import React, { FC, useState } from "react";
import { useAppSelector } from "../redux/store";
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
        <div className="relative w-full flex justify-center items-center border-2 border-gray-800 text-5xl text-center p-3.5 rounded-md">
            <span className="font-mono">{sessionID}</span>

            <div className="absolute right-3">
                {showCopied ? (
                    <span className="flex items-center gap-x-2.5 text-utility-green">
                        <span className="text-3xl font-medium">Copied</span>

                        <ClipboardCheck className="transition-colors duration-200 cursor-pointer" size={24} onClick={handleCopy} />
                    </span>
                ) : (
                    <Clipboard className="text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer" size={24} onClick={handleCopy} />
                )}
            </div>
        </div>
    );
};
