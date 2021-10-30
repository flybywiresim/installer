import React from 'react';
import { Select, Progress } from 'antd';
import styled from 'styled-components';
import { colors, dropShadow, fontSizes } from "renderer/style/theme";
import headerBackground from "renderer/assets/a32nx-background.png";

export const Container = styled.div<{ wait: number }>`
    visibility: ${props => props.wait ? 'hidden' : 'visible'};
`;

export const HeaderImage = styled.div`
    height: 35vh;
    max-height: 400px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url(${headerBackground});
    background-size: cover;
    background-position: center;
    color: white;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 12px;
`;

export const ModelName = styled.span`
    font-size: 36px;
    font-weight: 700;
    line-height: 30px;
`;

export const ModelSmallDesc = styled.span`
    font-size: 20px;
`;

export const ModelInformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  
  *:first-child {
    line-height: 40px;
  }
  
  *:last-child {
    line-height: 20px;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

export const BaseButton = styled.button`
  font-size: 1.45em !important;
  font-weight: 600;
  border-width: 0 !important;
  border-radius: 5px;

  padding: .25em 1.25em .15em;
  
  cursor: pointer;

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
`;

export const DialogContainer = styled.div`
  grid-column: start / end;
  grid-row: 1;
`;

export const TopContainer = styled.div`
  grid-column: start / end;
  grid-row: 2;
  
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  column-gap: 2em;
`;

export const LeftContainer = styled.div`
  grid-column: start / middle;
  grid-row: 3;
`;

export const DetailsContainer = styled.div``;

export const VersionHistoryContainer = styled.div`
  grid-row: 3 / span 2;
`;

export const DownloadProgress = styled(Progress)`
  top: -10px;

  .ant-progress-inner {
    border: none;
    height: 3px;
    background-color: ${colors.navy};
  }

  .ant-progress-bg {
    border-radius: 0;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  z-index: 10;
  
  column-gap: 1.25em;
`;

export const StateText = styled(props => <span className={props.className}>{props.children}</span>)`
  font-size: ${fontSizes.huge} !important;
  color: ${colors.titleContrast};  
`;
