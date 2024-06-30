import React, { FC, useEffect } from 'react';
import { AddonTrack } from 'renderer/utils/InstallerConfiguration';

export const QaTrack: AddonTrack = {
  name: 'QA',
  key: 'qa',
  url: '',
  description: 'Used for QA builds',
  releaseModel: {
    type: 'githubRelease',
  },
  isExperimental: true,
  warningContent: 'This is a PR build, there are no guarantees anything will work period.',
};

interface QaDropdownProps {
  selectedPr: number;
  setSelectedPr: (value: string) => void;
  prs: any[];
}

export const QaDropdown: FC<QaDropdownProps> = ({ selectedPr, setSelectedPr, prs }) => {
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
