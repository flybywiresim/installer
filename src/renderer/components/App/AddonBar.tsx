import React, { FC } from "react";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";

export interface AddonBarProps {
    publisher: Publisher,
}

export const AddonBar: FC<AddonBarProps> = ({ publisher, children }) => (
    <div className="flex flex-col gap-y-5 bg-quasi-white px-6 py-7 h-full">
        <div className="flex flex-col -space-y-4">
            <h2 className="font-extrabold">{publisher.name}</h2>
            <h1 className="font-extrabold">Addons</h1>
        </div>

        {children}
    </div>
);

export interface AddonBarItemProps {
    addon: Addon,
    enabled?: boolean,
    selected?: boolean
    className?: string,
    onClick?: () => void,
}

export const AddonBarItem: FC<AddonBarItemProps> = ({ addon, enabled, selected, className, onClick }) => {
    const dependantStyles = selected ? "bg-gradient-to-r from-cyan to-blue-500 text-white" : `bg-grey-medium text-black border-2 border-transparent ${enabled && 'hover:border-cyan'}`;

    return (
        <div
            className={`w-full p-5 flex flex-col justify-between rounded-md transition duration-200 ${dependantStyles} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
            onClick={enabled && onClick}
        >
            <h1 className="text-xl text-current font-bold">{addon.aircraftName}</h1>
            <h1 className="text-5xl text-current font-extrabold">{addon.name}</h1>
        </div>
    );
};
