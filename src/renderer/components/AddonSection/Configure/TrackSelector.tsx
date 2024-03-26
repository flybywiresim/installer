import React from 'react';
import { useSelector } from 'react-redux';
import { InstallerStore } from 'renderer/redux/store';
import { Check } from 'tabler-icons-react';
import { Addon, AddonTrack } from 'renderer/utils/InstallerConfiguration';

import '../index.css';
import { twMerge } from 'tailwind-merge';

export const Tracks: React.FC = ({ children }) => (
  <div className="flex flex-row items-stretch justify-start gap-3">{children}</div>
);

type TrackProps = {
  className?: string;
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  handleSelected(track: AddonTrack): void;
};

export const Track: React.FC<TrackProps> = ({ isSelected, isInstalled, handleSelected, addon, track }) => {
  const latestVersionName = useSelector<InstallerStore, string>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name ?? '<unknown>',
  );

  return (
    <div
      className={twMerge(
        `relative flex w-60 cursor-pointer flex-row items-center rounded-sm-md border-2 border-transparent bg-navy-dark text-white transition-all duration-200 hover:border-navy-lightest hover:text-gray-300`,
        isSelected && 'border-2 border-cyan text-cyan',
      )}
      onClick={() => handleSelected(track)}
    >
      <div
        className={`h-12 w-1 rounded-r-xl transition-all duration-200${isSelected ? 'scale-y-100' : 'scale-y-50'}`}
      />
      <div className="flex flex-col px-3 py-2.5">
        <span className="text-xl text-current">{track.name}</span>
        <span className="mt-0.5 font-manrope text-3xl font-medium tracking-wider text-current">
          {latestVersionName}
        </span>
      </div>
      {isInstalled && <Check className={`absolute right-4 stroke-current text-cyan`} strokeWidth={3} />}
    </div>
  );
};
