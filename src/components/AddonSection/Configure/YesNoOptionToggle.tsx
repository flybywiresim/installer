import React, { FC } from 'react';
import { Toggle } from "../../Toggle";

export interface YesNoOptionToggleProps {
    enabled: boolean,
    onToggle: () => void
    downloadSize?: string,
}

export const YesNoOptionToggle: FC<YesNoOptionToggleProps> = ({ enabled, onToggle, downloadSize }) => {
    const handleClick = onToggle;

    const bgColor = enabled ? 'bg-utility-green' : 'bg-navy-light';
    const titleColor = enabled ? 'text-navy' : 'text-quasi-white';

    return (
        <div className={`flex items-center gap-x-10 ${bgColor} px-10 py-12 rounded-md transition-color duration-200 cursor-pointer`} onClick={handleClick}>
            <Toggle value={enabled} onToggle={handleClick} scale={1.5} onColor={'bg-utility-green'} />

            <span className="flex gap-x-20">
                <span className={`font-manrope font-bold text-4xl ${titleColor}`}>Terrain Database</span>
                {downloadSize && (
                    <span className={`font-manrope font-semibold text-4xl ${titleColor}`}>{downloadSize}</span>
                )}
            </span>
        </div>
    );
};
