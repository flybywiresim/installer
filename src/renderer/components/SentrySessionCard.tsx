import React, { FC, useState } from 'react';
import { useAppSelector } from 'renderer/redux/store';
import { Clipboard, ClipboardCheck } from 'react-bootstrap-icons';
import { clipboard } from 'electron';

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
    <div className="relative flex w-full items-center justify-center rounded-md border-2 border-gray-800 p-3.5 text-center text-2xl">
      {showCopied ? (
        <>
          <span className="font-mono text-utility-green">Copied!</span>
          <div className="absolute right-3">
            <span className="flex items-center gap-x-2.5">
              <ClipboardCheck
                className="cursor-pointer transition-colors duration-200"
                size={24}
                onClick={handleCopy}
              />
            </span>
          </div>
        </>
      ) : (
        <>
          <span className="font-mono">Copy Sentry Code to clipboard: {sessionID}</span>
          <div className="absolute right-3">
            <span className="flex items-center gap-x-2.5">
              <Clipboard
                className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-300"
                size={24}
                onClick={handleCopy}
              />
            </span>
          </div>
        </>
      )}
    </div>
  );
};
