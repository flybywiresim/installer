import { Layout, Menu as AntdMenu } from 'antd';
import styled from 'styled-components';

export const Menu = styled(AntdMenu)`
  border-right: 1px solid #bfbfbf !important;
`;

export const PageSider = styled(Layout.Sider)`
    background-color: #222c3d;
    
    .ant-layout-sider-trigger {
        height: 40px;
        line-height: 40px;
        background-color: #232323;
    }

`;
