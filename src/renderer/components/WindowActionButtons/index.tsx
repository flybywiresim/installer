import React, { PropsWithChildren } from 'react';
import { BorderOutlined, CloseOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Container } from './styles';
import InstallerUpdate from '../InstallerUpdate';
import { shell } from 'electron';

export type ButtonProps = { id?: string, className?: string, onClick?: () => void, isClose?: boolean }

export const Button: React.FC<ButtonProps> = ({ id, className, onClick, isClose, children }: PropsWithChildren<ButtonProps>) => {
    return (
        <button onClick={onClick ?? (() => {})} id={id} className={`w-12 h-12 flex flex-row justify-center items-center text-gray-200 ${isClose ? 'hover:bg-red-500' : 'hover:bg-gray-700'} ${className}`}>{children}</button>
    );
};

function index(): JSX.Element {

    const openGithub = () => shell.openExternal("https://github.com/flybywiresim/a32nx/issues/new/choose");

    return (
        <Container>
            <InstallerUpdate />
            <Button onClick={openGithub} ><ExclamationCircleOutlined /></Button>
            <Button id="min-button"><MinusOutlined /></Button>
            <Button id="max-button"><BorderOutlined /></Button>
            <Button id="close-button" isClose><CloseOutlined /></Button>
        </Container>
    );
}

export default index;
