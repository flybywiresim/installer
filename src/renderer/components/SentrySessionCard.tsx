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
    <div className="relative flex w-full items-center justify-center rounded-md border-2 border-gray-800 p-3.5 text-center text-5xl">
      <span className="font-mono">{sessionID}</span>

      <div className="absolute right-3">
        {showCopied ? (
          <span className="flex items-center gap-x-2.5 text-utility-green">
            <span className="text-3xl font-medium">Copied</span>

            <ClipboardCheck className="cursor-pointer transition-colors duration-200" size={24} onClick={handleCopy} />
          </span>
        ) : (
          <Clipboard
            className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-300"
            size={24}
            onClick={handleCopy}
          />
        )}
      </div>
    </div>
  );
};
