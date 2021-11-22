import React from "react";
import { FC } from "react";
import { Publisher } from "renderer/utils/InstallerConfiguration";

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
    publisher: Publisher,
}

export const NavBarPublisher: FC<NavBarPublisherProps> = ({ publisher }) => (
    <NavBarItem>
        <img width={32} src={publisher.logoUrl} />
    </NavBarItem>
);
