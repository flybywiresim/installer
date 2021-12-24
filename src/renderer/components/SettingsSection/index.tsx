import React from 'react';
import { Menu } from './styles';

import GeneralSettings from 'renderer/components/GeneralSettings';

const index = (): JSX.Element => {
    return (
        <div className="bg-navy-lighter text-white flex items-center justify-center m-8 rounded-xl overflow-hidden p-8">
            <div className="w-full flex flex-row">
                <Menu theme="dark" mode="inline" style={{ width: 256, marginBottom: 'auto', backgroundColor: '#222c3d', color: 'white' }}
                    defaultSelectedKeys={['general-settings']}>
                    <Menu.Item key="general-settings" style={{ backgroundColor: 'rgba(0, 224, 254, 0.2)', }}>
                            General Settings
                    </Menu.Item>
                </Menu>
                <div className="pl-24 w-full bg-navy-lighter">
                    <GeneralSettings />
                </div>
            </div>
        </div>
    );
};

export default index;
