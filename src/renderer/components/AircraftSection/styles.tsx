import React from 'react';
import { Button, Select, Progress } from 'antd';
import styled from 'styled-components';
import { DownloadOutlined } from '@ant-design/icons';

export const Container = styled.div`
  
`;

export const HeaderImage = styled.div`
      height: 400px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url('https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png');
  background-size: cover;
    color: white;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-left: 18px;
    padding-right: 18px;
    padding-bottom: 8px;
`;

export const ModelName = styled.span`
    font-size: 32px;
    font-weight: 800;
    line-height: 30px;
`;

export const ModelSmallDesc = styled.span`
    font-size: 20px;
`;

export const ModelInformationContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

const BaseButton = styled(Button)`
    font-size: 1.15em !important;
    border-width: 0 !important;
    border-radius: 5px;
`;

export const VersionsButton = styled(BaseButton)`
    margin-right: 8px;
`;

export const CheckUpdateButton = styled(BaseButton)`
    color: white !important;
`;
export const ModelsDropdownButton = styled(BaseButton)``;

function select<T>(...items: T[]): T {
    for (const item of items) {
        if (item) {
            return item;
        }
    }
    return undefined;
}

type SelectStyle = {
    width?: number,
    backgroundColor?: string,
    color?: string,
    borderColor?: string
};

export const BaseSelect = styled(Select)<{ styling?: SelectStyle }>`
    .ant-select-selector {
      font-size: 1.15em !important;
      border-width: 0 !important;
      border-radius: 5px !important;
      width: ${props => select(String(props.styling?.width), 'unset')} !important;
      background-color: ${props => select(props.styling?.backgroundColor, 'unset')} !important;
      color: ${props => select(props.styling?.color, 'unset')} !important;
      border-color: ${props => select(props.styling?.borderColor, props.styling?.backgroundColor, 'unset')} !important;
      .ant-select-selection-item {
        padding-top: 1px;
      }
    }
`;

export const VersionSelect = styled(BaseSelect)`
    width: 155px;
    margin-right: 8px;
`;

export const Content = styled.div`
    padding: 30px 24px 24px 24px;
    h3 {
        color: #FFFFFF;
    }
`;

export const EngineOptionsContainer = styled.div`
  margin-top: 40px;
`;

export const EngineOption = styled.div`
    width: 215px;
    border-radius: 8px;
    background-size: cover;
    padding: 12px 12px 4px 12px;
    font-size: 14px;
    margin-right: 20px;
    border: 1px solid #d9d9d9;
    color: #d9d9d9;

    #selected-icon {
        font-size: 50px;
        position: absolute;
    }

    img {
        margin-bottom: 5px;
    }

`;

export const DownloadProgress = styled(Progress)`
  top: -10px;

  .ant-progress-inner {
    border: none;
    height: 3px;
    background-color: #1C1C1C;
  }

  .ant-progress-bg {
    border-radius: 0;
  }
`;

export const InstallButton = styled(props => <BaseButton
    type="primary"
    icon={<DownloadOutlined />}
    {...props}
/>)`
    min-width: 114px;    
`;

export const UpdateButton = styled(
    props =>
        <InstallButton
            style={{
                background: "#fa8c16",
                borderColor: "#fa8c16"
            }}
            {...props}
        >Update</InstallButton>)``;

export const CancelButton = styled(
    props =>
        <InstallButton
            icon={null}
            style={{
                background: "#fa8c16",
                borderColor: "#fa8c16"
            }}
            {...props}
        />)``;

export const InstalledButton = styled(
    props =>
        <InstallButton
            icon={null}
            style={{
                color: "#dddddd",
                background: "#2e995e",
                borderColor: "#2e995e",
                pointerEvents: "none"
            }}
            {...props}
        >Installed</InstallButton>)``;
