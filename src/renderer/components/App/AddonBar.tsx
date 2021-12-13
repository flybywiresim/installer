import React, { FC } from "react";
import { Addon, Publisher, PublisherButton } from "renderer/utils/InstallerConfiguration";
import { shell } from 'electron';
import * as BootstrapIcons from 'react-bootstrap-icons';
import { Icon } from "react-bootstrap-icons";

export interface AddonBarProps {
    publisher: Publisher,
}

export const AddonBar: FC<AddonBarProps> = ({ publisher, children }) => {
    const PublisherButtons = (buttons: PublisherButton[]) => {
        const groups: PublisherButton[][] = [];

        let currentGroup: PublisherButton[] = [];
        for (const button of buttons) {
            if (button.inline) {
                currentGroup.push(button);
            } else {
                groups.push(currentGroup);
                currentGroup = [button];
            }
        }

        if (!groups.includes(currentGroup)) {
            groups.push(currentGroup);
        }

        return (
            <>
                {groups.map((group) => (
                    <div className="flex flex-row gap-x-3">
                        {group.map((button) => (
                            <AddonBarPublisherButton button={button} />
                        ))}
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="flex flex-col gap-y-5 bg-quasi-white px-6 py-7 h-full">
            <div className="flex flex-col -space-y-7">
                <h2 className="font-extrabold">{publisher.name}</h2>
                <h1 className="font-extrabold">Addons</h1>
            </div>

            {children}

            <div className="flex flex-col gap-y-3 mt-auto">
                {publisher.buttons && (
                    PublisherButtons(publisher.buttons)
                )}
            </div>
        </div>
    );
};

export interface AddonBarItemProps {
    addon: Addon,
    enabled?: boolean,
    selected?: boolean
    className?: string,
    onClick?: () => void,
}

export const AddonBarItem: FC<AddonBarItemProps> = ({ addon, enabled, selected, className, onClick }) => {
    const dependantStyles = selected ? "bg-gradient-to-l from-cyan to-blue-500 text-white" : `bg-grey-medium text-black border-2 border-transparent ${enabled && 'hover:border-cyan'}`;

    return (
        <div
            className={`w-full p-5 flex flex-col justify-between rounded-lg transition duration-200 ${dependantStyles} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
            onClick={enabled ? onClick : undefined}
        >
            <h1 className="text-xl text-current font-bold">{addon.aircraftName}</h1>
            <img className="h-10 w-max" src={selected ? addon.titleImageUrlSelected : addon.titleImageUrl} />
        </div>
    );
};

interface AddonBarPublisherButtonProps {
    button: PublisherButton,
}

const AddonBarPublisherButton: FC<AddonBarPublisherButtonProps> = ({ button }) => {
    const handleClick = async () => {
        switch (button.action) {
            case 'openBrowser':
                await shell.openExternal(button.url);
                break;
            case 'internal': // TODO
                break;
        }
    };

    const ButtonIcon = (BootstrapIcons as Record<string, Icon>)[button.icon] ?? 'span';

    return (
        <button
            className="w-full flex flex-row justify-center items-center px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-md"
            disabled={button.inop}
            onClick={handleClick}
        >
            <span className="w-full flex flex-row justify-start items-center">
                {button.forceStroke ? (
                    <ButtonIcon size={24} fill="none" stroke="black" strokeWidth={.75} />
                ) : (
                    <ButtonIcon size={24} />
                )}

                {button.text.length > 0 && (
                    <span className="text-xl font-manrope font-semibold ml-3.5">{button.text}</span>
                )}
            </span>
        </button>
    );
};
