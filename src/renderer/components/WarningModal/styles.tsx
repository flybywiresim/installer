import { Modal } from "antd";
import styled from 'styled-components';
import { colors } from "renderer/style/theme";

export const WarningModalBase = styled(Modal)`
    .ant-modal-content {
      background: ${colors.navyLighter};
      border: 5px solid;
      border-color: ${colors.navyLighter};
      border-radius: 5px;
    }

    .ant-modal-header {
      color: ${colors.teal50};
      background: ${colors.navyLighter};
      border: none;
    }
    
    .ant-modal-title {
      font-size: 1.85em;
      font-weight: 700;
      color: ${colors.gray50};
      margin-top: 8px;
    }
    
    .ant-modal-close {
      color: ${colors.gray50};
      font-size: 1.25rem;
      outline: none;
      
      &:hover {
        color: #fa3516;
      }
    }
    
    .ant-modal-body {
      color: ${colors.teal50};
      background: ${colors.navyLighter};
      border: none;
      
      a {
        font-weight: 500;
        color: ${colors.tealLight};
      }
    }
    
    .ant-modal-footer {
      color: ${colors.teal50};
      background: ${colors.navyLighter};
      border: none;

      .ant-btn {
        border-radius: 5px;
        font-size: 1.25em;
        outline: none;
        
        span {
          display: block;
          margin-top: -1px;
          padding: 0 .5em;
          font-weight: 700;
        }
      }

      .ant-btn-primary {
        background: ${colors.positive};
        border-color: ${colors.positive};
        outline: none;
      }
    }
`;
