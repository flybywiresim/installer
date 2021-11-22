import React, { FC } from "react";
import { Addon } from "renderer/utils/InstallerConfiguration";

export const AddonBar: FC = ({ children }) => (
    <div className="flex flex-col gap-y-5 bg-quasi-white px-6 py-7" style={{ width: '100em' }}>
        <div className="flex flex-col">
            <h2>FlyByWire Simulations</h2>
            <h1 className="-mt-1.5">Addons</h1>
        </div>

        {children}
    </div>
);

export interface AddonBarItemProps {
    addon: Addon,
    className?: string,
}

export const AddonBarItem: FC<AddonBarItemProps> = ({ addon, className }) => (
    <div className={`w-full p-5 flex flex-col justify-between rounded-md ${className}`}>
        <h1 className="text-xl font-bold">Airbus {addon.aircraftName}</h1>
        <h1 className="text-5xl font-extrabold">{addon.name}</h1>
    </div>
);
