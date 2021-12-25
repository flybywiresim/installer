import React, { FC } from "react";
import { useIsDarkTheme } from "common/settings";
import { NavLink, useRouteMatch } from "react-router-dom";

export interface SideBarProps {
    className?: string;
}

export const SideBar: FC<SideBarProps> = ({ className, children }) => {
    const darkTheme = useIsDarkTheme();

    const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

    return (
        <div className={`flex flex-col gap-y-5 ${textClass} ${darkTheme ? 'bg-navy' : 'bg-quasi-white'} px-6 py-7 h-full ${className}`} style={{ width: '28rem' }}>
            {children}
        </div>
    );
};

export interface SideBarItemProps {
    enabled?: boolean;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}

export const SideBarItem: FC<SideBarItemProps> = ({ enabled = true, selected = false, onClick = () => {}, className, children }) => {
    const darkTheme = useIsDarkTheme();

    const defaultBorderStyle = darkTheme ? 'border-navy' : 'border-quasi-white';

    const enabledUnselectedStyle = darkTheme ? 'bg-navy-light text-quasi-white' : 'bg-grey-medium text-navy';

    const dependantStyles = selected ? ` bg-gradient-to-l from-cyan to-blue-500 text-white` : `${enabledUnselectedStyle} ${enabled && 'hover:border-cyan'}`;

    return (
        <div
            className={`w-full relative p-5 flex flex-col justify-between rounded-lg transition duration-200 border-2 ${defaultBorderStyle} ${dependantStyles} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
            onClick={enabled ? onClick : undefined}
        >
            {children}
        </div>
    );
};

export const SideBarTitle: FC = ({ children }) => {
    const darkTheme = useIsDarkTheme();

    const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

    return (
        <div className="flex flex-col -space-y-7">
            <h2 className={`${textClass} font-extrabold -mb-1`}>{children}</h2>
        </div>
    );
};

export interface SideBarLinkProps {
    to: string;
}

export const SideBarLink: FC<SideBarLinkProps> = ({ to, children }) => {
    const match = useRouteMatch(to);

    return (
        <NavLink to={to}>
            <SideBarItem selected={!!match}>
                {children}
            </SideBarItem>
        </NavLink>
    );
};
