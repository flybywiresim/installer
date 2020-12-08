import { Button } from 'antd'
import React from 'react'
import { Container, PageTitle, SettingItemContent, SettingItemName, SettingsItem, SettingsItems } from './styles'

function index() {
    return (
        <Container>
            <PageTitle>General Settings</PageTitle>
            <SettingsItems>
                <SettingsItem>
                    <SettingItemName>Install Path</SettingItemName>
                    <SettingItemContent>C:\\Somewhere</SettingItemContent>
                    <Button type="link" style={{color: '#41a4ff'}}>Modify</Button>
                </SettingsItem>
            </SettingsItems>
        </Container>
    )
}

export default index
