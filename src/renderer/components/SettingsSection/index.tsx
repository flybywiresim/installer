import React, { FC, useState } from 'react';
import { GeneralSettings } from 'renderer/components/SettingsSection/General';
import { Redirect, Route } from 'react-router-dom';
import { AboutSettings } from 'renderer/components/SettingsSection/About';
import { SideBar, SideBarLink, SideBarTitle } from 'renderer/components/SideBar';
import { CustomizationSettings } from './Customization';
import { DownloadSettings } from './Download';
import { DeveloperSettings } from './Developer';
import settings from 'renderer/rendererSettings';
import * as packageInfo from '../../../../package.json';
import { Button, ButtonType } from '../Button';
import { PromptModal, useModals } from 'renderer/components/Modal';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';

interface InstallButtonProps {
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ResetButton: FC<InstallButtonProps> = ({ type = ButtonType.Neutral, onClick, children }) => (
  <Button type={type} className={`w-full`} onClick={onClick}>
    {children}
  </Button>
);

export const SettingsSection = (): JSX.Element => {
  const { showModal } = useModals();

  const [showDevSettings, setShowDevSettings] = useState(false);

  const handleReset = async () => {
    showModal(
      <PromptModal
        title="Are you sure?"
        bodyText={`You are about to reset all settings to their default values. You cannot undo this.`}
        confirmColor={ButtonType.Danger}
        onConfirm={async () => {
          settings.reset('mainSettings' as never);

          // Workaround to flush the defaults
          settings.set('metaInfo.lastVersion', packageInfo.version);
          ipcRenderer.send(channels.window.reload);
        }}
      />,
    );
  };

  return (
    <div className="w-full overflow-hidden bg-navy-lighter text-white">
      <div className="flex size-full flex-row items-stretch">
        <SideBar className="shrink-0">
          <div
            onClick={(event) => {
              if (event.ctrlKey && event.altKey) {
                setShowDevSettings((old) => !old);
              }
            }}
          >
            <SideBarTitle>Settings</SideBarTitle>
          </div>

          <SideBarLink to="/settings/general">
            <span className="font-manrope text-3xl font-semibold">General</span>
          </SideBarLink>

          <SideBarLink to="/settings/download">
            <span className="font-manrope text-3xl font-semibold">Download</span>
          </SideBarLink>

          {/*<SideBarLink to="/settings/customization">*/}
          {/*    <span className="text-2xl font-manrope font-bold">*/}
          {/*        Customization*/}
          {/*    </span>*/}
          {/*</SideBarLink>*/}

          {showDevSettings && (
            <SideBarLink to="/settings/developer">
              <span className="font-manrope text-3xl font-semibold">Developer</span>
            </SideBarLink>
          )}

          <SideBarLink to="/settings/about">
            <span className="font-manrope text-3xl font-semibold">About</span>
          </SideBarLink>
          <div className="relative mt-auto">
            <ResetButton type={ButtonType.Neutral} onClick={handleReset}>
              Reset Settings
            </ResetButton>
          </div>
        </SideBar>

        <div className="grow border-l border-gray-700 bg-navy px-12 py-8">
          <Route exact path="/settings">
            <Redirect to="/settings/general" />
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

          {showDevSettings && (
            <Route path="/settings/developer">
              <DeveloperSettings />
            </Route>
          )}

          <Route path="/settings/about">
            <AboutSettings />
          </Route>
        </div>
      </div>
    </div>
  );
};
