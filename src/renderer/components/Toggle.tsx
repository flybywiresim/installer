import React, { FC } from 'react';

interface ToggleProps {
    value: boolean;
    onToggle: (value: boolean) => void;
    scale?: number;
    onColor?: string;
}

export const Toggle: FC<ToggleProps> = ({ value, onToggle, scale = 1, onColor = 'bg-cyan-medium' }) => (
    <div className="flex items-center w-14 h-8 rounded-full cursor-pointer bg-navy-light" onClick={() => onToggle(!value)} style={{ transform: `scale(${scale})` }}>
        <div className={`w-6 h-6 bg-gray-400 rounded-full transition mx-1.5 duration-200 transform ${value && `${onColor}`}`} style={{ transform: `translate(${value ? '12px' : '0'}, -0.5px)` }} />
    </div>
);
