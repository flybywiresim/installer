import React from "react";
import { FC } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Publisher } from "renderer/utils/InstallerConfiguration";
import { Settings } from "tabler-icons-react";

export const NavBar: FC = ({ children }) => {
    const history = useHistory();

    return (
        <div className="bg-navy p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-y-5">
                {children}
            </div>

            <NavbarItem to="/settings" onClick={() => {}} selected={history.location.pathname === "/settings"}>
                <Settings className="text-gray-100" size={34} strokeWidth={1} />
            </NavbarItem>
        </div>
    );
};

export interface NavBarItemProps {
    to?: string,
    selected: boolean,
    onClick: () => void
}

export interface NavBarPublisherProps extends NavBarItemProps {
    publisher: Publisher,
}

export const NavbarItem: FC<NavBarItemProps> = ({ to = '/', selected, onClick, children }) => (
    <NavLink
        to={to}
        className={`w-16 h-16 shadow-md hover:shadow-lg flex flex-col justify-center items-center rounded-md border-2 border-navy-light bg-transparent hover:bg-navy-light transition duration-200 ${selected && 'bg-navy-light'}`}
        onClick={onClick}
    >
        {children}
    </NavLink>
);

export const NavBarPublisher: FC<NavBarPublisherProps> = ({ publisher, selected, onClick }) => {
    console.log(location.pathname);

    return (
        <NavbarItem selected={selected} onClick={onClick}>
            <img width={32} src={publisher.logoUrl} />
        </NavbarItem>
    );
};
