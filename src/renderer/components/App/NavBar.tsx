import React from "react";
import { FC } from "react";

export const NavBar: FC = ({ children }) => (
    <div className="bg-navy p-5 flex flex-col gap-y-5">
        {children}
    </div>
);

export const NavBarItem: FC = ({ children }) => (
    <div className="w-16 h-16 bg-navy-light flex flex-col justify-center items-center rounded-md">
        {children}
    </div>
);

export interface NavBarPublisherProps {
    icon: string,
}

export const NavBarPublisher: FC<NavBarPublisherProps> = ({ icon }) => (
    <NavBarItem>
        <img width={32} src={icon} />
    </NavBarItem>
);
