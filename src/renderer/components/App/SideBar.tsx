import React, { useEffect, useState } from "react";
import { ChevronDown, Circle } from "tabler-icons-react";
import { Mod } from "renderer/components/App/index";
import { useSelector, } from "react-redux";
import { InstallerStore } from "renderer/redux/store";
import { InstallStatus } from "renderer/components/AircraftSection";

export type SidebarItemProps = { iSelected: boolean, onClick: () => void, className?: string }

export const SidebarItem: React.FC<SidebarItemProps> = ({ iSelected, onClick, children, className }) => {
    return (
        <div
            className={`w-full flex flex-row items-center transition-all duration-200 ${iSelected ? 'bg-navy-lighter' : 'bg-navy-light-contrast'} hover:bg-navy-lightest pl-5 py-4 cursor-pointer ${className}`}
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

type SidebarModProps = { mod: Mod, isSelected: boolean, setSelectedItem: (key: string) => void }

export const SidebarMod: React.FC<SidebarModProps> = ({ mod, isSelected, setSelectedItem }) => {
    const [downloadState, setDownloadState] = useState('');
    const modDownloadState = useSelector<InstallerStore>(state => state.installStatus);

    useEffect(() => {
        switch (modDownloadState) {
            case InstallStatus.FreshInstall:
                setDownloadState('Not installed');
                break;
            case InstallStatus.NeedsUpdate:
                setDownloadState('Update Available');
                break;
            case InstallStatus.DownloadPrep:
            case InstallStatus.Downloading:
            case InstallStatus.DownloadEnding:
                setDownloadState('Installing...');
                break;
            default:
                setDownloadState('Installed');
                break;
        }
    }, [modDownloadState]);

    return (
        <SidebarItem iSelected={isSelected} onClick={() => setSelectedItem(mod.key)}>
            <div className="flex flex-col ml-3">
                <span className="text-xl text-gray-200 font-semibold" key={mod.key}>{mod.name}</span>
                <code className="text-lg text-teal-50">{downloadState}</code>
            </div>

            <Circle className="text-green-400 ml-auto mr-4" size={28} />
        </SidebarItem>
    );
};
