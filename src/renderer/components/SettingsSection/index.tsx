import React from 'react';
import GeneralSettings from 'renderer/components/GeneralSettings';
import { Redirect, Route } from "react-router-dom";
import { AboutSettings } from "renderer/components/SettingsSection/About";
import { SideBar, SideBarLink, SideBarTitle } from "renderer/components/SideBar";

export const SettingsSection = (): JSX.Element => {
    return (
        <div className="w-full bg-navy-lighter text-white overflow-hidden">
            <div className="w-full h-full flex flex-row items-stretch">
                <SideBar className="flex-shrink-0">
                    <SideBarTitle>Settings</SideBarTitle>

                    <SideBarLink to="/settings/general">
                        <span className="text-2xl font-manrope font-bold">
                            General Settings
                        </span>
                    </SideBarLink>

                    <SideBarLink to="/settings/about">
                        <span className="text-2xl font-manrope font-bold">
                            About
                        </span>
                    </SideBarLink>
                </SideBar>

                <div className="flex-grow px-12 py-8 bg-navy-light border-l border-gray-700">
                    <Route exact path="/settings">
                        <Redirect to="/settings/general"/>
                    </Route>

                    <Route path="/settings/general">
                        <GeneralSettings />
                    </Route>

                    <Route path="/settings/about">
                        <AboutSettings />
                    </Route>
                </div>
            </div>
        </div>
    );
};
