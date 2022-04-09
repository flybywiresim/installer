import React, { FC } from 'react';

interface ToggleProps {
    value: boolean;
    onToggle: (value: boolean) => void;
}

export const Toggle: FC<ToggleProps> = ({ value, onToggle }) => (
    <div className="flex items-center w-14 h-8 rounded-full cursor-pointer bg-navy-light" onClick={() => onToggle(!value)}>
        <div className={`w-6 h-6 bg-white rounded-full transition mx-1.5 duration-200 transform ${value && 'translate-x-5 bg-cyan-medium'}`} />
    </div>
);
