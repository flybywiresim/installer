import styled, { css } from 'styled-components';
import { Layout, Menu } from 'antd';
import { colors } from "renderer/style/theme";
import React, { useEffect, useState } from "react";
import Store from "electron-store";
import * as fs from "fs";
import { Mod } from "renderer/utils/InstallerConfiguration";
import i18n from "i18next";

const settings = new Store<{ [p: string]: string }>({ watch: true });

export const { Content } = Layout;

export const Container = styled.div`
    height: 100vh;
    button {
        outline: none;
    }
`;

export const PageHeader = styled.div`
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
`;

const menuItemCss = css`
    margin: 0 !important;
    height: 34px;
    background-color: ${colors.listItem};
    font-size: 16px;
    font-weight: 600;
    :hover {
        background-color: #7e7e7e !important;
    }
`;

export const MenuItem = styled(Menu.Item)`
    display: flex;
    align-items: center;
    ${menuItemCss}
`;

export const AircraftSubMenuItem = styled(Menu.SubMenu)`
    background-color: #444444 !important;
    img {
        height: 16px;
        margin-right: 6px;
    }

    .ant-menu-submenu-title {
        margin: 0;
    }

`;

export const HomeMenuItem = styled(MenuItem)`
    img {
        height: 13px !important;
    }
`;

export const PageSider = styled.div`
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .ant-layout-sider-trigger {
    height: 40px;
    line-height: 40px;
    background-color: #232323;
  }
`;

export const MainLayout = styled(Layout)`
    height: 100%;
`;

const AircraftDetailsContainer = styled.div`
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
  
  img#icon-A32NX {
    height: 173px !important;
    position: absolute;
    right: -192px;
    top: -62px;
  }

  img#icon-A380X {
    height: 172px !important;
    position: absolute;
    right: -180px;
    top: -55px;
  }
`;

const AircraftInfo = styled.div`
  width: 22em;
        
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  
  margin-top: 3em;
  margin-left: 14px;
`;

const AircraftName = styled.h4`
  font-size: 18px;
  margin-top: -2em;
  line-height: 18px;
`;

const AircraftInstalledVersion = styled.h6`
  font-size: 14px;
  line-height: 18px;
`;

const AircraftMenuItemBase = styled(MenuItem)`
    display: flex !important;
    justify-content: space-between;
    height: 73px !important;
    padding-left: 8px !important;
`;

const InstallationStates = {
    INSTALLED: i18n.t('SideBar.Installed'),
    NOT_INSTALLED: i18n.t('SideBar.NotInstalled')
};

type AircraftMenuItemProps = { mod: Mod, disabled: boolean };

export const AircraftMenuItem = (props: AircraftMenuItemProps): JSX.Element => {
    const getInstallText = (value: boolean) => value ? InstallationStates.INSTALLED : InstallationStates.NOT_INSTALLED;

    const installDir = `${settings.get('mainSettings.msfsPackagePath')}\\${props.mod.targetDirectory}\\`;

    let isInstalled = false;

    try {
        isInstalled = fs.existsSync(installDir);
    } catch (e) {
        console.error(e);
    }

    const [installationStatus, setInstallationStatus] = useState<string>(() => getInstallText(isInstalled));

    useEffect(() => settings.onDidChange(`cache.${props.mod.key}.lastUpdated`, () => setInstallationStatus(getInstallText(true))));

    return (
        <AircraftMenuItemBase {...props}>
            <AircraftDetailsContainer>
                <AircraftInfo>
                    <AircraftName>{props.mod.name}</AircraftName>
                    <AircraftInstalledVersion>{props.mod.enabled ? installationStatus : i18n.t('SideBar.NotAvailable')}</AircraftInstalledVersion>
                </AircraftInfo>
                <img id={`icon-${props.mod.key}`} src={props.mod.menuIconUrl} alt={props.mod.aircraftName}/>
            </AircraftDetailsContainer>
        </AircraftMenuItemBase>
    );
};
