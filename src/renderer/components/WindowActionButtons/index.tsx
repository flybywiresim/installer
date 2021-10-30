import React, { PropsWithChildren } from 'react';
import { BorderOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons';

export type ButtonProps = { id?: string, className?: string, onClick?: () => void, isClose?: boolean }

export const Button: React.FC<ButtonProps> = ({ id, className, onClick, isClose, children }: PropsWithChildren<ButtonProps>) => {
    return (
        <button
            className={`w-14 h-full flex flex-row justify-center items-center text-gray-200 ${isClose ? 'hover:bg-red-500' : 'hover:bg-gray-700'} ${className}`}
            onClick={onClick ?? (() => {})}
            id={id}
        >
            {children}
        </button>
    );
};

export const WindowButtons: React.FC = () => {
    return (
        <div className="h-14 flex flex-row ml-auto">
            <Button id="min-button"><MinusOutlined /></Button>
            <Button id="max-button"><BorderOutlined /></Button>
            <Button id="close-button" isClose><CloseOutlined /></Button>
        </div>
    );
};
