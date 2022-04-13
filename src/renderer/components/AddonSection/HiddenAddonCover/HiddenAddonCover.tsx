import React, { FC, useEffect, useState } from "react";

import FBWTail from "renderer/assets/FBW-Tail.svg";
import { useSetting } from "common/settings";
import { Addon } from "renderer/utils/InstallerConfiguration";

const NUMBER_OF_REVEAL_STEPS = 4;

export interface HiddenAddonCoverProps {
    addon: Addon,
}

export const HiddenAddonCover: FC<HiddenAddonCoverProps> = ({ addon }) => {
    const [steps, setSteps] = useState(0);

    const handleClick = () => {
        setSteps((old) => old + 1);
    };

    const [, setAddonDiscovered] = useSetting<boolean>(
        "cache.main.discoveredAddons." + addon.key
    );

    useEffect(() => {
        if (steps >= NUMBER_OF_REVEAL_STEPS) {
            setAddonDiscovered(true);
        }
    }, [steps]);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <img
                className="cursor-pointer"
                src={FBWTail}
                width={100}
                style={{ transform: `rotate(${steps * 360}deg)`, transition: 'transform 300ms linear' }}
                onClick={handleClick}
            />

            <svg className="mt-12" viewBox="0 0 80 2" style={{ width: '300px' }}>
                <rect x={0} y={0} rx="1px" ry="1px" width={80} height={2} fill="#171E2C" style={{ transition: 'all 200ms linear' }} />
                <rect x={0} y={0} rx="1px" ry="1px" width={steps * (80 / NUMBER_OF_REVEAL_STEPS)} height={2} fill="#00E0FE" style={{ transition: 'all 200ms linear' }} />
            </svg>
        </div>
    );
};
