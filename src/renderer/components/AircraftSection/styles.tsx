import React from 'react';
import { Select, Progress } from 'antd';
import styled from 'styled-components';
import { DownloadOutlined } from '@ant-design/icons';
import { dropShadow } from "renderer/style/theme";

export const Container = styled.div<{ wait: number }>`
    visibility: ${props => props.wait ? 'hidden' : 'visible'};
`;

export const HeaderImage = styled.div`
    height: 400px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url('https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/assets/installer/a32nx-background.png');
    background-size: cover;
    background-position: center;
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

const BaseButton = styled.button`
  font-size: 1.45em !important;
  font-weight: 600;
  border-width: 0 !important;
  border-radius: 5px;

  padding: .25em 1.25em .15em;

  ${dropShadow};
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
    display: grid;
    grid-template-columns: [start] 3fr [middle] 21.5em [end];
    grid-template-rows: auto auto;
    grid-gap: 1.32em;
    padding: 6px 24px 24px 24px;
    h3 {
        color: #FFFFFF;
    }
`;

export const TopContainer = styled.div`
  grid-column: start / end;
  grid-row: 1;
  
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  column-gap: 2em;
`;

export const LeftContainer = styled.div`
  grid-column: start / middle;
  grid-row: 2;
`;

export const DetailsContainer = styled.div``;

export const VersionHistoryContainer = styled.div`
  grid-row: 2 / span 2;
`;

export const EngineOptionsContainer = styled.div``;

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

const InstallButtonTemplate = styled(props => <BaseButton
    type="primary"
    icon={<DownloadOutlined />}
    {...props}
/>)`
    min-width: 114px;    
`;

export const InstallButton = styled(props =>
    <InstallButtonTemplate
        style={{
            background: "#fa8c16",
            borderColor: "#fa8c16"
        }}
        {...props}
    >Install</InstallButtonTemplate>)``;

export const UpdateButton = styled(
    props =>
        <InstallButtonTemplate
            style={{
                background: "#fa8c16",
                borderColor: "#fa8c16"
            }}
            {...props}
        >Update</InstallButtonTemplate>)``;

export const CancelButton = styled(
    props =>
        <InstallButtonTemplate
            icon={null}
            style={{
                background: "#fa8c16",
                borderColor: "#fa8c16"
            }}
            {...props}
        />)``;

export const InstalledButton = styled(
    (props: { inGitRepo: boolean }) =>
        <InstallButtonTemplate
            icon={null}
            style={{
                color: "#dddddd",
                background: "#2e995e",
                borderColor: "#2e995e",
                pointerEvents: "none"
            }}
            {...props}
        >{props.inGitRepo ? 'Installed (git)' : 'Installed'}</InstallButtonTemplate>)``;

export const MSFSIsOpenButton = styled(
    props =>
        <InstallButtonTemplate
            icon={null}
            style={{
                color: "#dddddd",
                background: "#bc0d0d",
                borderColor: "#bc0d0d",
                pointerEvents: "none"
            }}
            {...props}
        >Please close MSFS</InstallButtonTemplate>)``;
