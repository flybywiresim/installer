import React from 'react'
import { Layout } from 'antd'
import { Container, Content, Menu, PageSider} from './styles'

import GeneralSettings from '../GeneralSettings'

function index() {
    return (
        <Container>
            <Layout>
                <PageSider>
                    <Menu theme="dark" mode="inline" style={{ width: 256, backgroundColor: ' #313131', color: 'white' }}
        defaultSelectedKeys={['general-settings']}>
                        <Menu.Item key="general-settings">
                            General Settings
                        </Menu.Item>
                    </Menu>
                </PageSider>
                <Content>
                    <GeneralSettings />
                </Content>
            </Layout>
        </Container>
    )
}

export default index
