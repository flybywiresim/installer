import { Modal } from "antd";
import styled from 'styled-components';
import { colors } from "renderer/style/theme";

export const WarningModal = styled(Modal)`
    .ant-modal-header {
        color: ${colors.title};
        background: ${colors.cardBackground};
        border: none;
    }
    
    .ant-modal-title {
        color: ${colors.title};
    }
    
    .ant-modal-close {
        color: ${colors.title};
    }
    
    .ant-modal-body {
        color: ${colors.title};
        background: ${colors.cardBackground};
        border: none;
    }
    
    .ant-modal-footer {
        color: ${colors.title};
        background: ${colors.cardBackground};
        border: none;
    }
    
    .ant-btn-primary {
        background: ${colors.positive};
        border-color: ${colors.positive};
    }
`;
