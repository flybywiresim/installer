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
import { PromptModal, useModals } from "renderer/components/Modal";

interface InstallButtonProps {
    type?: ButtonType,
    disabled?: boolean,
    className?: string;
    onClick?: () => void;
}

export const ResetButton: FC<InstallButtonProps> = ({
    type = ButtonType.Neutral,
    onClick,
    children,
}) => (
    <Button
        type={type}
        className={`w-full`}
        onClick={onClick}
    >
        {children}
    </Button>
);

export const SettingsSection = (): JSX.Element => {
    const { showModal } = useModals();

    const handleReset = async () => {
        showModal(
            <PromptModal
                title='Are you sure?'
                bodyText={`You are about to reset all settings to their default values. You cannot undo this.`}
                confirmColor={ButtonType.Danger}
                onConfirm={async () => {
                    settings.reset('mainSettings' as never);

                    // Workaround to flush the defaults
                    settings.set('metaInfo.lastVersion', packageInfo.version);
                }}/>
        );
    };

    return (
        <div className="w-full bg-navy-lighter text-white overflow-hidden">
            <div className="w-full h-full flex flex-row items-stretch">
                <SideBar className="flex-shrink-0">
                    <SideBarTitle>Settings</SideBarTitle>

                    <SideBarLink to="/settings/general">
                        <span className="text-3xl font-manrope font-semibold">
                            General
                        </span>
                    </SideBarLink>

                    <SideBarLink to="/settings/download">
                        <span className="text-3xl font-manrope font-semibold">
                            Download
                        </span>
                    </SideBarLink>

                    {/*<SideBarLink to="/settings/customization">*/}
                    {/*    <span className="text-2xl font-manrope font-bold">*/}
                    {/*        Customization*/}
                    {/*    </span>*/}
                    {/*</SideBarLink>*/}

                    <SideBarLink to="/settings/about">
                        <span className="text-3xl font-manrope font-semibold">
                            About
                        </span>
                    </SideBarLink>
                    <div className="relative mt-auto">
                        <ResetButton type={ButtonType.Neutral} onClick={handleReset}>
                            Reset Settings
                        </ResetButton>
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
