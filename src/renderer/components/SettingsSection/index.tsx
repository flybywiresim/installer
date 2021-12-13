import React from 'react';
import { Layout } from 'antd';
import { Menu, PageSider } from './styles';

import GeneralSettings from 'renderer/components/GeneralSettings';

function index(): JSX.Element {
    return (
        <div className="bg-navy-lighter text-white flex items-center justify-center m-8 rounded-xl overflow-hidden p-8">
            <Layout>
                <PageSider>
                    <Menu theme="dark" mode="inline" style={{ width: 256, backgroundColor: '#222c3d', color: 'white' }}
                        defaultSelectedKeys={['general-settings']}>
                        <Menu.Item key="general-settings" style={{ backgroundColor: '#009ba2', }}>
                            General Settings
                        </Menu.Item>
                    </Menu>
                </PageSider>
                <Layout.Content className="pl-24 bg-navy-lighter">
                    <GeneralSettings />
                </Layout.Content>
            </Layout>
        </div>
    );
}

export default index;
