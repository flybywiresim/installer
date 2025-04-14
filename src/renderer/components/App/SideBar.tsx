import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Download, Refresh } from 'tabler-icons-react';
import { useSelector } from 'react-redux';
import { InstallerStore } from 'renderer/redux/store';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';

export type SidebarItemProps = { enabled?: boolean; selected: boolean; onClick: () => void; className?: string };

export const SidebarItem: React.FC<SidebarItemProps> = ({ enabled = true, selected, onClick, children, className }) => {
  return (
    <div
      className={`flex w-full flex-row items-center transition-all duration-200 ${selected ? 'bg-navy-lighter' : 'bg-navy-light-contrast'} ${enabled ? 'hover:bg-navy-lightest' : ''} py-4 pl-5 ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export type SidebarPublisherProps = { name: string; logo: string };

export const SidebarPublisher: React.FC<SidebarPublisherProps> = ({ name, logo, children }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <span
        onClick={() => setExpanded((old) => !old)}
        className="flex cursor-pointer flex-row items-center py-3.5 pl-3 text-lg text-white transition-colors duration-300 hover:bg-navy-lightest"
      >
        <ChevronDown
          className={`text-gray-200 transition-transform duration-300${expanded ? 'rotate-0' : '-rotate-90'}`}
          size={28}
        />
        <img className="ml-1 mr-2 w-4" src={logo} alt="" />
        <span className="text-base text-gray-100">{name}</span>
      </span>
      {expanded && children}
    </>
  );
};

type SidebarAddonProps = { addon: Addon; isSelected: boolean; handleSelected: (key: string) => void };

export const SidebarAddon: React.FC<SidebarAddonProps> = ({ addon, isSelected, handleSelected }) => {
  const [downloadState, setStatusText] = useState('');
  const [icon, setIcon] = useState<'notAvailable' | 'install' | 'installing' | 'installed' | 'update'>('install');
  const addonDownloadState = useSelector<InstallerStore>((state) => {
    try {
      return state.installStatus[addon.key] as InstallStatus;
    } catch (e) {
      return InstallStatus.Unknown;
    }
  });

  useEffect(() => {
    if (addon.enabled) {
      switch (addonDownloadState) {
        case InstallStatus.Hidden:
          setStatusText('Not Available');
          setIcon('notAvailable');
          break;
        case InstallStatus.NotInstalled:
        case InstallStatus.Unknown:
          setStatusText('Not Installed');
          setIcon('install');
          break;
        case InstallStatus.NeedsUpdate:
          setStatusText('Update Available');
          setIcon('update');
          break;
        case InstallStatus.DownloadPrep:
        case InstallStatus.Downloading:
        case InstallStatus.Decompressing:
        case InstallStatus.DownloadRetry:
        case InstallStatus.DownloadCanceled:
        case InstallStatus.DownloadError:
        case InstallStatus.DownloadEnding:
          setStatusText('Installing...');
          setIcon('installing');
          break;
        default:
          setStatusText('Installed');
          setIcon('installed');
          break;
      }
    } else {
      setStatusText('Not Available');
      setIcon('notAvailable');
    }
  }, [addon.enabled, addonDownloadState]);

  const Icon = () => {
    switch (icon) {
      case 'notAvailable':
        return <Download className="ml-auto mr-4 text-gray-700" size={28} />;
      case 'install':
        return <Download className="ml-auto mr-4 text-gray-400" size={28} />;
      case 'installing':
        return <Refresh className="ml-auto mr-4 animate-spin-reverse text-yellow-400" size={28} />;
      case 'installed':
        return <Check className="ml-auto mr-4 text-green-400" size={28} />;
      case 'update':
        return <Download className="ml-auto mr-4 text-yellow-400" size={28} />;
    }
  };

  return (
    <SidebarItem
      enabled={addon.enabled}
      selected={isSelected}
      onClick={() => {
        if (addon.enabled) {
          handleSelected(addon.key);
        }
      }}
    >
      <div className={`ml-3 flex flex-col ${addon.enabled ? 'opacity-100' : 'opacity-60'}`}>
        <span className="text-xl font-semibold text-gray-200" key={addon.key}>
          {addon.name}
        </span>
        <code className="text-lg text-teal-50">{downloadState}</code>
      </div>

      <Icon />
    </SidebarItem>
  );
};
