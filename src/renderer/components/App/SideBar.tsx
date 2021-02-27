import React, { useState } from "react";
import { ChevronDown } from "tabler-icons-react";

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
