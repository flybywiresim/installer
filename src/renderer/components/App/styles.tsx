import styled, { css } from 'styled-components';
import { Layout, Menu } from 'antd';
import { colors } from "renderer/style/theme";
import React, { useEffect, useState } from "react";
import { Mod } from "renderer/components/App/index";
import Store from "electron-store";

const settings = new Store<{ [p: string]: string }>({ watch: true });

const { Header, Content, Sider } = Layout;

export const Container = styled.div`
    height: 100vh;
`;

export const PageHeader = styled(Header)`
    display: flex;
    align-items: center;
    height: 50px;
    padding-left: 18px;
    background-color: #232323;
    -webkit-app-region: drag;
`;

export const PageContent = styled(Content)`
    overflow-y: scroll;
    background-color: #1C1C1C;
    margin: 0 !important;
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

export const SettingsMenuItem = styled(MenuItem)`
    position: absolute !important;
    bottom: 0px;
    width: 100%;
`;

export const HomeMenuItem = styled(MenuItem)`
    img {
        height: 13px !important;
    }
`;

export const PageSider = styled(Sider)`
  background-color: #313131;

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
    INSTALLED: 'installed',
    NOT_INSTALLED: 'not installed'
};

type AircraftMenuItemProps = { mod: Mod, disabled: boolean };

export const AircraftMenuItem = (props: AircraftMenuItemProps) => {
    const getInstallText = (value: boolean) => value ? InstallationStates.INSTALLED : InstallationStates.NOT_INSTALLED;

    const [installationStatus, setInstallationStatus] = useState<string>(() => getInstallText(!!settings.get(`cache.${props.mod.key}.lastUpdated`)));

    useEffect(() => settings.onDidChange(`cache.${props.mod.key}.lastUpdated`, value => setInstallationStatus(getInstallText(!!value))));

    return (
        <AircraftMenuItemBase {...props}>
            <AircraftDetailsContainer>
                <AircraftInfo>
                    <AircraftName>{props.mod.name}</AircraftName>
                    <AircraftInstalledVersion>{installationStatus}</AircraftInstalledVersion>
                </AircraftInfo>
                <img id={`icon-${props.mod.key}`} src={props.mod.menuIconUrl} alt={props.mod.aircraftName}/>
            </AircraftDetailsContainer>
        </AircraftMenuItemBase>
    );
};
