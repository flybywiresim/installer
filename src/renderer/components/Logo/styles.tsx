import styled from "styled-components";
import { colors } from "renderer/style/theme";

export const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    img {
        grid-area: logo;
        height: 1.2rem;
    }
`;

export const Title = styled.span`
  line-height: 26px;
  border-left: 1px solid ${colors.mutedTextDark};
  
  color: ${colors.gray50};
  
  margin-left: 1.1em;
  padding-left: 1.1em;
  
  font-size: 1.4em;
  font-weight: 600;
`;
