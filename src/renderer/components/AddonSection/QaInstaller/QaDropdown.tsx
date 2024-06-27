import React, { FC, useEffect, useState } from 'react';
import { useGitHub } from 'renderer/components/AddonSection/GitHub/GitHubContext';
import { Button } from 'renderer/components/Button';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { Directories } from 'renderer/utils/Directories';
import { useSetting } from 'renderer/rendererSettings';

interface QaDropdownProps {
  selectedPr: number;
  setSelectedPr: (value: string) => void;
  prs: any[];
}

export const QaDropdown: FC<QaDropdownProps> = ({ selectedPr, setSelectedPr, prs }) => {
  const gitHub = useGitHub();
  const [gitHubToken] = useSetting('mainSettings.gitHubToken');
  const [usernameSet] = useSetting('mainSettings.gitHubUsername');

  useEffect(() => {
    if (selectedPr !== 0) {
      // gitHub.getPrArtifactUrl(selectedPr);
    }
  }, [selectedPr]);

  const handleSelect = (value: string) => {
    setSelectedPr(value);
  };

  return (
    <div className="mt-10 flex flex-row justify-between">
      <h5 className="font-bold text-white">QA Selector</h5>
      <div className="flex flex-row space-x-2">
        <Button
          onClick={async () => {
            if (selectedPr === 0) {
              await ipcRenderer.invoke(
                channels.installManager.nuclearBomb,
                Directories.temp(),
                Directories.installLocation(),
              );
            } else {
              await ipcRenderer.invoke(
                channels.installManager.directInstallFromUrl,
                0,
                await gitHub.getPrArtifactUrl(selectedPr),
                Directories.temp(),
                Directories.installLocation(),
                gitHubToken,
                usernameSet,
              );
            }
          }}
        >
          Nuke
        </Button>
        <select
          value={selectedPr}
          onChange={(event) => handleSelect(event.currentTarget.value)}
          name="Date Layout"
          className="w-60 cursor-pointer rounded-md border-2 border-navy bg-navy-light px-3.5 py-2.5 text-xl text-white outline-none"
        >
          <option value={0}>Disable PRs</option>
          {prs.map((item) => (
            <option value={item.number}>
              {item.number}: {item.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
