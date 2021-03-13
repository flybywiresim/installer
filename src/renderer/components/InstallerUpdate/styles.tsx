import styled from "styled-components";
import { colors } from "renderer/style/theme";

export const Container = styled.div`
    padding-left: 1rem;
    padding-right: 1rem;
    margin-right: 2rem;
    background: ${colors.positive};
    height: 50%;
`;

export const UpdateText = styled.h6`
    margin-bottom: 0;
    line-height: 1.6rem;
    color: #fff !important;
`;
