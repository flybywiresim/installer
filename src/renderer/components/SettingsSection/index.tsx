import React from 'react';
import GeneralSettings from 'renderer/components/SettingsSection/General';
import { Redirect, Route } from "react-router-dom";
import { AboutSettings } from "renderer/components/SettingsSection/About";
import { SideBar, SideBarLink, SideBarTitle } from "renderer/components/SideBar";
import CustomizationSettings from './Customization';
import DownloadSettings from './Download';
import settings from 'common/settings';
import * as packageInfo from '../../../../package.json';

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

                    <SideBarLink to="/settings/customization">
                        <span className="text-2xl font-manrope font-bold">
                            Customization
                        </span>
                    </SideBarLink>

                    <SideBarLink to="/settings/about">
                        <span className="text-2xl font-manrope font-bold">
                            About
                        </span>
                    </SideBarLink>
                    <div className="w-full relative bottom-5 mt-auto">
                        <div>
                            <div
                                className="w-full relative p-5 flex flex-col justify-between rounded-lg items-center border-2 border-red-600 text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white cursor-pointer transition duration-200 text-2xl font-manrope font-bold "
                                onClick={handleReset}
                            >
                    Reset settings to default
                            </div>
                        </div>
                    </div>
                </SideBar>

                <div className="flex-grow px-12 py-8 bg-navy-light border-l border-gray-700">
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
