import React, { useEffect, useState } from "react";
import { ArrowBarToLeft, Check, ChevronDown, Download, Refresh } from "tabler-icons-react";
import { useSelector, } from "react-redux";
import { InstallerStore } from "renderer/redux/store";
import { InstallStatus } from "renderer/components/AircraftSection";
import { Addon } from "renderer/utils/InstallerConfiguration";

export type SidebarItemProps = { enabled?: boolean, iSelected: boolean, onClick: () => void, className?: string }

export const SidebarItem: React.FC<SidebarItemProps> = ({ enabled = true, iSelected, onClick, children, className }) => {
    return (
        <div
            className={`w-full flex flex-row items-center transition-all duration-200 ${iSelected ? 'bg-navy-lighter' : 'bg-navy-light-contrast'} ${enabled ? 'hover:bg-navy-lightest' : ''} pl-5 py-4 ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
            onClick={onClick}
        >{children}</div>
    );
};

export type SidebarPublisherProps = { name: string, logo: string }

export const SidebarPublisher: React.FC<SidebarPublisherProps> = ({ name, logo, children }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <>
            <span onClick={() => setExpanded(old => !old)} className="flex flex-row items-center transform transition-colors duration-300 hover:bg-navy-lightest text-lg text-white pl-3 py-3.5 cursor-pointer">
                <ChevronDown className={`text-gray-200 transform transition-transform duration-300 ${expanded ? 'rotate-0' : '-rotate-90'}`} size={28} />
                <img className="w-4 ml-1 mr-2" src={logo} alt="" />
                <span className="text-base text-gray-100">{name}</span>
            </span>
            {expanded && children}
        </>
    );
};

export const SidebarCompact: React.FC<SidebarPublisherProps> = ({ logo, children }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <span className="bg-navy-lighter flex flex-row items-end text-lg text-white pl-3 py-3.5">
                <ArrowBarToLeft onClick={() => setExpanded(old => !old)} className={`text-gray-200 transform cursor-pointer transform ${expanded ? 'rotate-0' : '-rotate-180'}`} size={35} />
                <img className="ml-1 mr-2" src={logo} alt="" />
                <span className="text-base text-gray-100"></span>
            </span>
            {expanded && children}
        </>
    );
};

type SidebarAddonProps = { addon: Addon, isSelected: boolean, handleSelected: (key: string) => void }

export const SidebarAddon: React.FC<SidebarAddonProps> = ({ addon, isSelected, handleSelected }) => {
    const [downloadState, setStatusText] = useState('');
    const [icon, setIcon] = useState<'notAvailable' | 'install' | 'installing' | 'installed' | 'update'>('install');
    const addonDownloadState = useSelector<InstallerStore>(state => state.installStatus);

    useEffect(() => {
        if (addon.enabled) {
            switch (addonDownloadState) {
                case InstallStatus.FreshInstall:
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
    }, [addonDownloadState]);

    const Icon = () => {
        switch (icon) {
            case 'notAvailable':
                return <Download className="text-gray-700 ml-auto mr-4" size={28} />;
            case 'install':
                return <Download className="text-gray-400 ml-auto mr-4" size={28} />;
            case 'installing':
                return <Refresh className="text-yellow-400 ml-auto mr-4 animate-spin-reverse" size={28} />;
            case 'installed':
                return <Check className="text-green-400 ml-auto mr-4" size={28} />;
            case 'update':
                return <Download className="text-yellow-400 ml-auto mr-4" size={28} />;
        }
    };

    return (
        <SidebarItem enabled={addon.enabled} iSelected={isSelected} onClick={() => {
            if (addon.enabled) {
                handleSelected(addon.key);
            }
        }}>
            <div className={`flex flex-col ml-3 ${addon.enabled ? 'opacity-100' : 'opacity-60'}`}>
                <span className="text-xl text-gray-200 font-semibold" key={addon.key}>{addon.name}</span>
                <code className="text-lg text-teal-50">{downloadState}</code>
            </div>

            <Icon />
        </SidebarItem>
    );
};
