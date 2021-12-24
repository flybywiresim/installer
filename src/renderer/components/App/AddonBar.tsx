import React, { FC } from "react";
import { Addon, Publisher, PublisherButton } from "renderer/utils/InstallerConfiguration";
import { shell } from 'electron';
import * as BootstrapIcons from 'react-bootstrap-icons';
import { Icon } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { useAppSelector } from "renderer/redux/store";
import { AircraftSectionURLParams } from "../AircraftSection";
import { useIsDarkTheme } from "common/settings";

export interface AddonBarProps {
    publisher: Publisher,
}

export enum UITheme {
    Light = 'light',
    Dark = 'dark',
}

export const AddonBar: FC = ({ children }) => {
    const darkTheme = useIsDarkTheme();

    const { publisherName } = useParams<AircraftSectionURLParams>();
    const publisherData = useAppSelector(state => state.configuration.publishers.find(pub => pub.name === publisherName));

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
                    <div className="flex flex-row gap-x-4">
                        {group.map((button, index) => (
                            <AddonBarPublisherButton button={button} key={index} />
                        ))}
                    </div>
                ))}
            </>
        );
    };

    const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

    return (
        <div className={`flex flex-col gap-y-5 ${textClass} ${darkTheme ? 'bg-navy' : 'bg-quasi-white'} px-6 py-7 h-full`}>
            <div className="flex flex-col -space-y-7">
                <h2 className={`${textClass} font-extrabold`}>{publisherData.name}</h2>
            </div>

            {children}

            <div className="flex flex-col gap-y-4 mt-auto">
                {publisherData.buttons && (
                    PublisherButtons(publisherData.buttons)
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
    const darkTheme = useIsDarkTheme();

    const defaultBorderStyle = darkTheme ? 'border-navy' : 'border-quasi-white';

    const enabledUnselectedStyle = darkTheme ? 'bg-navy-light text-quasi-white' : 'bg-grey-medium text-navy';

    const dependantStyles = selected ? ` bg-gradient-to-l from-cyan to-blue-500 text-white` : `${enabledUnselectedStyle} ${enabled && 'hover:border-cyan'}`;

    return (
        <div
            className={`w-full p-5 flex flex-col justify-between rounded-lg transition duration-200 border-2 ${defaultBorderStyle} ${dependantStyles} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
            onClick={enabled ? onClick : undefined}
        >
            <h1 className="text-xl text-current font-bold">{addon.aircraftName}</h1>
            <img className="h-10 w-max mt-1" src={selected || darkTheme ? addon.titleImageUrlSelected : addon.titleImageUrl} />
            {/*<span className="text-5xl font-semibold">A32NX</span>*/}
        </div>
    );
};

interface AddonBarPublisherButtonProps {
    button: PublisherButton,
}

const AddonBarPublisherButton: FC<AddonBarPublisherButtonProps> = ({ button }) => {
    const darkTheme = useIsDarkTheme();

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

    const backgroundStyle = darkTheme ? 'bg-navy-light hover:bg-navy-lightest' : 'bg-gray-200 hover:bg-gray-300';

    return (
        <button
            className={`w-full h-16 flex flex-row justify-center items-center px-5 py-3 ${backgroundStyle} rounded-md`}
            disabled={button.inop}
            onClick={handleClick}
        >
            <span className="w-full h-12 flex flex-row justify-start items-center">
                {button.forceStroke ? (
                    <ButtonIcon size={24} fill="none" stroke="black" strokeWidth={.75} />
                ) : (
                    <ButtonIcon size={24} />
                )}

                {button.text.length > 0 && (
                    <span className="font-manrope font-bold ml-4" style={{ fontSize: '18px' }}>{button.text}</span>
                )}
            </span>
        </button>
    );
};
