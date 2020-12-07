import { hot } from 'react-hot-loader';
import React, { useState } from 'react';

import { Layout, Menu, } from 'antd';
import {
  SettingFilled,
} from '@ant-design/icons';
import Icon from '@ant-design/icons';
import Logo from '../LogoWithText';
import TailWhite from '../../assets/FBW-Tailwhite.svg'
// import { ReactComponent as PlaneSVG } from '../../assets/Plane.svg'
import A320SVG from '../../assets/a32nx_nose.svg'
import { Container, PageHeader, HomeMenuItem, PageContent, PageSider, SettingsMenuItem, MainLayout, AircraftSubMenuItem, AircraftMenuItem, AircraftInstalledVersion, AircraftName, AircraftDetailsContainer } from './styles';
import HomeSection from '../HomeSection'
import SettingsSection from '../SettingsSection'
import AircraftSection from '../AircraftSection'
import WindowActionButtons from '../WindowActionButtons'

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<String>('1');

  function toggleCollapse() {
    setCollapsed(value => !value)
  }

  let sectionToShow;
  switch (selectedItem) {
    case 'home':
      sectionToShow = <HomeSection />
      break;
    case 'a32nx':
      sectionToShow = <AircraftSection aircraftModel="A320neo" />
      break;
    case 'settings':
      sectionToShow = <SettingsSection />
      break;

    default:
      break;
  }

  return (
    <Container>
      <MainLayout>
        <PageHeader>
          <Logo />
          <WindowActionButtons />
        </PageHeader>

        <Layout className="site-layout">
          <PageSider onCollapse={toggleCollapse} collapsible collapsed={collapsed}>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['home']} onSelect={selectInfo => setSelectedItem(selectInfo.key.toString())}>
              <HomeMenuItem key="home" icon={<img src={TailWhite} />}>
                Home
              </HomeMenuItem>
              <AircraftSubMenuItem key="aircraft"  title="Aircraft">
                <AircraftMenuItem key="a32nx">
                  <AircraftDetailsContainer>
                    <AircraftName>A320neo</AircraftName>
                  </AircraftDetailsContainer>
                  <img src={A320SVG} />
                </AircraftMenuItem>
              </AircraftSubMenuItem>
              <SettingsMenuItem key="settings" icon={<SettingFilled />}>
                Settings
              </SettingsMenuItem>
            </Menu>
          </PageSider>
          <PageContent>
            {sectionToShow}
          </PageContent>
        </Layout>
      </MainLayout>
    </Container >
  );
}

export default hot(module)(App);