import React from "react";
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { Settings } from "tabler-icons-react";

export const NavBar: FC = ({ children }) => {
    return (
        <div className="bg-navy p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-y-5">
                {children}
            </div>

            <NavbarItem to="/settings">
                <Settings className="text-gray-100" size={34} strokeWidth={1} />
            </NavbarItem>
        </div>
    );
};

export interface NavBarItemProps {
    to: string;
}

export interface NavBarPublisherProps extends NavBarItemProps {
    logoUrl: string;
}

export const NavbarItem: FC<NavBarItemProps> = ({ to = '/', children }) => {
    const BASE_STYLE = "w-16 h-16 shadow-md hover:shadow-lg flex flex-col justify-center items-center rounded-md border-2 border-navy-light bg-transparent hover:bg-navy-light transition duration-200";

    return (
        <NavLink
            to={to}
            className={BASE_STYLE}
            activeClassName={`${BASE_STYLE} bg-navy-light`}
        >
            {children}
        </NavLink>
    );
};

export const NavBarPublisher: FC<NavBarPublisherProps> = ({ to, logoUrl }) => (
    <NavbarItem to={to}>
        <img width={32} src={logoUrl} />
    </NavbarItem>
);
