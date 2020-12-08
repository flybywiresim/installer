import styled from 'styled-components';

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
    font-size: 15px;
    color: #bfbfbf;
    margin-bottom: 15px;
`;

