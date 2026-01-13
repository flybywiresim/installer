import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { InstallerStore } from 'renderer/redux/store';
import { Check, ChevronDown } from 'tabler-icons-react';
import { Addon, AddonTrack } from 'renderer/utils/InstallerConfiguration';
import cn from 'renderer/utils/cn';
import '../index.css';

export const Tracks: React.FC = ({ children }) => (
  <div className="flex flex-row items-stretch justify-start gap-3">{children}</div>
);

type TrackProps = {
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  handleSelected(track: AddonTrack): void;
};

export const Track: React.FC<TrackProps> = ({ isSelected, isInstalled, handleSelected, addon, track }) => {
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name,
  );

  return (
    <div
      className={cn(
        'flex w-60 h-24 cursor-pointer flex-col rounded-sm-md border-2 border-transparent bg-navy-dark text-white transition-all duration-200 hover:border-navy-lightest hover:text-gray-300',
        isSelected && 'border-2 border-cyan text-cyan',
      )}
      onClick={() => handleSelected(track)}
    >
      <div className="flex flex-col px-3 py-2.5">
        <span className="text-xl text-current">{track.name}</span>
        <span className="mt-0.5 flex justify-between font-manrope text-3xl font-medium tracking-wider text-current">
          {latestVersionName ?? <span className="mt-1.5 block h-7 w-32 animate-pulse bg-navy-light"></span>}
          {isInstalled && <Check className={`-mt-3.5 stroke-current text-cyan`} strokeWidth={3} />}
        </span>
      </div>
    </div>
  );
};

type QATrackSelectorProps = {
  addon: Addon;
  tracks: AddonTrack[];
  selectedTrack: AddonTrack | null;
  installedTrack: AddonTrack | null;
  onTrackSelection: (track: AddonTrack) => void;
};

export const QATrackSelector: React.FC<QATrackSelectorProps> = ({
  addon,
  tracks,
  selectedTrack,
  installedTrack,
  onTrackSelection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedQATrack = tracks.find((track) => track.key === selectedTrack?.key);
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[selectedQATrack?.key]?.name,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrackSelect = (track: AddonTrack) => {
    onTrackSelection(track);
    setIsOpen(false);
  };

  return (
    <div className="relative w-max min-w-[400px] max-w-[650px]" ref={dropdownRef}>
      <div
        className={cn(
          'flex w-full h-24 cursor-pointer items-center justify-between rounded-sm-md border-2 border-transparent bg-navy-dark text-white transition-all duration-200 hover:border-navy-lightest hover:text-gray-300 px-4',
          selectedQATrack && 'border-2 border-cyan text-cyan',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 flex-col px-3 py-2.5">
          <span className="truncate text-xl text-current">
            {selectedQATrack ? selectedQATrack.name : 'Select QA Build'}
          </span>
          {selectedQATrack && (
            <span className="mt-0.5 flex justify-between font-manrope text-3xl font-medium tracking-wider text-current">
              {latestVersionName ?? <span className="mt-1.5 block h-7 w-32 animate-pulse bg-navy-light"></span>}
            </span>
          )}
        </div>

        <div className="flex min-w-24 items-center justify-end gap-2">
          {installedTrack === selectedQATrack && <Check className="stroke-current text-cyan" strokeWidth={3} />}
          <ChevronDown
            className={cn('stroke-current transition-transform duration-200 text-white', isOpen && 'rotate-180')}
            strokeWidth={2}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-sm-md border border-navy-lightest bg-navy-dark shadow-lg">
          {tracks.map((track) => (
            <QATrackDropdownItem
              key={track.key}
              addon={addon}
              track={track}
              isSelected={track.key === selectedTrack?.key}
              isInstalled={track.key === installedTrack?.key}
              onSelect={() => handleTrackSelect(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type QATrackDropdownItemProps = {
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  onSelect: () => void;
};

const QATrackDropdownItem: React.FC<QATrackDropdownItemProps> = ({
  addon,
  track,
  isSelected,
  isInstalled,
  onSelect,
}) => {
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name,
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 cursor-pointer text-white hover:bg-navy-light transition-colors duration-150',
        isSelected && 'text-cyan',
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-nowrap text-lg text-current">{track.name}</span>
        <span className={cn('font-manrope text-sm text-white', isSelected && 'text-cyan')}>
          {latestVersionName ?? 'Loading...'}
        </span>
      </div>

      {isInstalled && <Check className="stroke-current text-cyan" strokeWidth={3} />}
    </div>
  );
};
