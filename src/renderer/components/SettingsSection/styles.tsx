import { Layout, Menu as AntdMenu } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  font-size: 50px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #313131;
  margin: 30px;
  padding: 20px 0 20px 0;
`;

export const Content = styled(Layout.Content)`
  background-color: #313131;
  padding-left: 90px;
`;

export const Menu = styled(AntdMenu)`
  border-right: 1px solid #bfbfbf !important;
`;

export const PageSider = styled(Layout.Sider)`
    background-color: #313131;
    
    .ant-layout-sider-trigger {
        height: 40px;
        line-height: 40px;
        background-color: #232323;
    }

`;
