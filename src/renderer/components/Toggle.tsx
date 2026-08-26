import React, { FC } from 'react';
import cn from 'renderer/utils/cn';

interface ToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  scale?: number;
  bgColor?: string;
  onColor?: string;
}

export const Toggle: FC<ToggleProps> = ({
  value,
  onToggle,
  scale = 1,
  bgColor = 'bg-navy-light',
  onColor = 'bg-cyan-medium',
}) => (
  <div
    className={cn(`flex h-8 w-14 cursor-pointer items-center rounded-full text-3xl`, bgColor)}
    onClick={() => onToggle(!value)}
    style={{ transform: `scale(${scale})` }}
  >
    <div
      className={cn(`mx-1.5 size-6 rounded-full bg-gray-400 transition duration-200`, value && onColor)}
      style={{ transform: `translate(${value ? '12px' : '1px'}, 0)` }}
    />
  </div>
);
