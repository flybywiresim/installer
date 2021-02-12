import { Modal } from "antd";
import styled from 'styled-components';
import { colors } from "renderer/style/theme";

export const WarningModalBase = styled(Modal)`
    .ant-modal-content {
      background: ${colors.cardBackground};
      border: 5px solid;
      border-color: ${colors.cardBackground};
      border-radius: 5px;
    }

    .ant-modal-header {
      color: ${colors.title};
      background: ${colors.cardBackground};
      border: none;
    }
    
    .ant-modal-title {
      font-size: 1.85em;
      font-weight: 700;
      color: ${colors.title};
    }
    
    .ant-modal-close {
      color: ${colors.title};
      font-size: 1.25rem;
      
      &:hover {
        color: #fa3516;
      }
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

      .ant-btn {
        border-radius: 5px;
        font-size: 1.25em;
        
        span {
          display: block;
          margin-top: -1px;
          padding: 0 .75em;
          font-weight: 700;
        }
      }
      
      .ant-btn-primary {
        background: ${colors.positive};
        border-color: ${colors.positive};
      }
    }
`;
