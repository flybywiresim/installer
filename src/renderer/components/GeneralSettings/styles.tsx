import styled from 'styled-components';
import { colors } from "renderer/style/theme";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding-right: 26px;
`;

export const PageTitle = styled.span`
  font-size: 20px;
  margin-bottom: 30px;
`;

export const SettingsItems = styled.div`
  border-bottom: 1px solid #bfbfbf;
`;

export const SettingsItem = styled.div`
    display: flex;
    flex-direction: column;

    button {
        position: absolute;
        right: 40px;
    }

`;

export const SettingItemName = styled.span`
  font-size: 15px;
`;

export const SettingItemContent = styled.span`
    width: 80%;
    font-size: 15px;
    color: ${colors.mutedText} !important;
    margin-bottom: 15px;
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    :hover {
      color: ${colors.mutedTextDark} !important;
    }
`;

export const InfoButton = styled.h6`
  margin-top: 1.5em;
  color: ${colors.mutedText} !important;
  cursor: pointer;

  :hover {
    color: ${colors.mutedTextDark} !important;
  }
`;

export const ResetButton = styled.button`
  padding: 0.2em 0.5em 0.2em 0.5em;
  margin-top: 1.5em;
  color: white !important;
  background: ${colors.red};
  border: 2px solid;
  border-color: ${colors.red};
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;

  :hover {
    background: ${colors.redDarker};
    border-color: ${colors.redDarker};
  }
`;
