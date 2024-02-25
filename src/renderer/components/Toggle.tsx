import React, { FC } from 'react';

interface ToggleProps {
    value: boolean;
    onToggle: (value: boolean) => void;
    scale?: number;
    bgColor?: string,
    onColor?: string;
}

export const Toggle: FC<ToggleProps> = ({ value, onToggle, scale = 1, bgColor = 'bg-navy-light', onColor = 'bg-cyan-medium' }) => (
    <div className={`flex text-3xl items-center w-14 h-8 rounded-full cursor-pointer ${bgColor}`} onClick={() => onToggle(!value)} style={{ transform: `scale(${scale})` }}>
        <div className={`w-6 h-6 bg-gray-400 rounded-full transition mx-1.5 duration-200 transform ${value && `${onColor}`}`} style={{ transform: `translate(${value ? '12px' : '1px'}, 0)` }} />
    </div>
);
