import React, { FC, useEffect, useState } from 'react';
import FbwTail from 'renderer/assets/FBW-Tail.svg';
import * as packageInfo from '../../../../package.json';
import path from 'path';
import fs from 'fs';
import { shell } from 'electron';
import { ChangelogModal, useModals } from '../Modal';
import { SentrySessionCard } from 'renderer/components/SentrySessionCard';

export const AboutSettings: FC = () => {
  const [logoRotation, setLogoRotation] = useState(0);

  useEffect(() => {
    if (logoRotation / 360 > 5) {
      shell.openExternal('https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1');

      setLogoRotation(0);
    }
  });

  const handleOpenThirdPartyLicenses = () => {
    const licensesPath = path.join(process.resourcesPath, 'extraResources', 'licenses.md');

    if (!fs.existsSync(licensesPath)) {
      alert('The requested file does not exist.');
      return;
    }

    shell.openExternal(licensesPath).catch(console.error);
  };

  const handleLogoClick = () => {
    setLogoRotation((old) => old + 360);
  };

  const { showModal } = useModals();

  return (
    <div className="h-full flex flex-col gap-y-8 px-16 justify-center">
      <div className="flex flex-row items-center gap-x-10">
        <img
          className="cursor-pointer"
          src={FbwTail}
          width={60}
          onClick={handleLogoClick}
          style={{ transform: `rotate(${logoRotation}deg)`, transition: 'transform 200ms linear' }}
        />

        <div className="flex flex-col gap-y-3">
          <span className="text-4xl font-manrope font-bold">FlyByWire Installer</span>
          <a
            className="text-2xl text-gray-400 hover:text-gray-600 font-manrope font-bold"
            onClick={() => {
              showModal(<ChangelogModal />);
            }}
          >
            v{packageInfo.version}
          </a>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className="text-2xl">Copyright (c) 2020-2022 FlyByWire Simulations and its contributors</span>
        <span className="text-2xl">Licensed under the GNU General Public License Version 3</span>

        <span className="text-2xl text-gray-200 mt-4">
          All publisher associated logos are the intellectual property of their respective owners. Media content
          included is licensed under the terms set by the publisher.
        </span>

        <div className="mt-5" style={{ width: '520px' }}>
          <SentrySessionCard />
        </div>

        <a className="mt-4 text-gray-500 hover:text-gray-600" onClick={handleOpenThirdPartyLicenses}>
          Third party licenses
        </a>
      </div>
    </div>
  );
};
