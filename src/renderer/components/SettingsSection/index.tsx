import React, { FC } from 'react';
import GeneralSettings from 'renderer/components/SettingsSection/General';
import { Redirect, Route } from "react-router-dom";
import { AboutSettings } from "renderer/components/SettingsSection/About";
import { SideBar, SideBarLink, SideBarTitle } from "renderer/components/SideBar";
import CustomizationSettings from './Customization';
import DownloadSettings from './Download';
import settings from 'common/settings';
import * as packageInfo from '../../../../package.json';
import { Button, ButtonType } from '../Button';

interface InstallButtonProps {
    type?: ButtonType,
    disabled?: boolean,
    className?: string;
    onClick?: () => void;
}

export const InstallButton: FC<InstallButtonProps> = ({
    type = ButtonType.Neutral,
    disabled = false,
    onClick,
    children,
}) => (
    <Button
        type={type}
        disabled={disabled}
        className={`w-full`}
        onClick={onClick}
    >
        {children}
    </Button>
);

export const SettingsSection = (): JSX.Element => {
    const handleReset = async () => {
        settings.reset('mainSettings' as never);

        // Workaround to flush the defaults
        settings.set('metaInfo.lastVersion', packageInfo.version);
    };

    return (
        <div className="w-full bg-navy-lighter text-white overflow-hidden">
            <div className="w-full h-full flex flex-row items-stretch">
                <SideBar className="flex-shrink-0">
                    <SideBarTitle>Settings</SideBarTitle>

                    <SideBarLink to="/settings/general">
                        <span className="text-2xl font-manrope font-bold">
                            General
                        </span>
                    </SideBarLink>

                    <SideBarLink to="/settings/download">
                        <span className="text-2xl font-manrope font-bold">
                            Download
                        </span>
                    </SideBarLink>

                    {/*<SideBarLink to="/settings/customization">*/}
                    {/*    <span className="text-2xl font-manrope font-bold">*/}
                    {/*        Customization*/}
                    {/*    </span>*/}
                    {/*</SideBarLink>*/}

                    <SideBarLink to="/settings/about">
                        <span className="text-2xl font-manrope font-bold">
                            About
                        </span>
                    </SideBarLink>
                    <div className="relative bottom-5 mt-auto">
                        <InstallButton type={ButtonType.Danger} onClick={handleReset}>
                        Reset Settings To Default
                        </InstallButton>
                    </div>
                </SideBar>

                <div className="flex-grow px-12 py-8 bg-navy border-l border-gray-700">
                    <Route exact path="/settings">
                        <Redirect to="/settings/general"/>
                    </Route>

                    <Route path="/settings/general">
                        <GeneralSettings />
                    </Route>

                    <Route path="/settings/download">
                        <DownloadSettings />
                    </Route>

                    <Route path="/settings/customization">
                        <CustomizationSettings />
                    </Route>

                    <Route path="/settings/about">
                        <AboutSettings />
                    </Route>
                </div>
            </div>
        </div>
    );
};
