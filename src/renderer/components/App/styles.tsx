import styled from 'styled-components';
import { Layout } from 'antd';

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
