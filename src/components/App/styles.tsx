import styled, { css } from 'styled-components';
import { Layout, Menu } from 'antd';

const { Header, Content, Sider } = Layout;

export const Container = styled.div`
    height: 100vh;
`;

export const PageHeader = styled(Header)`
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 12px;
    background-color: #232323;
    -webkit-app-region: drag;

`;

export const PageContent = styled(Content)`
    background-color: #1C1C1C;
    margin: 0 !important;
`;

const menuItemCss = css`
    margin: 0 !important;
    height: 34px;
    background-color: #444444;
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
    
    .ant-layout-sider-trigger {
        height: 40px;
        line-height: 40px;
        background-color: #232323;
    }

`;

export const MainLayout = styled(Layout)`
    height: 100%;
`;

export const AircraftMenuItem = styled(MenuItem)`
    display: flex !important;
    justify-content: space-between;
    height: 73px !important;
    padding-left: 8px !important;

    #a320 {
        height: 173px;
        position: absolute;
        right: -191px;
        top: -62px;
    }

    #a380 {
        height: 173px;
        position: absolute;
        right: -180px;
        top: -55px;
    }

`;
export const AircraftDetailsContainer = styled.div`
    display: flex !important;
    flex-direction: column;
    align-items: baseline;
`;
export const AircraftName = styled.span`
        margin-left: 16px;
`;
export const AircraftInstalledVersion = styled.span`
    font-size: 10px;
`;
