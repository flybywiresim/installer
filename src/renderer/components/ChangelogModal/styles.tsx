import styled from 'styled-components';
import { colors } from 'renderer/style/theme';

export const InnerContainer = styled.div`
    height: 100%;
    width: 94.5%;
    margin: auto;
    margin-left: 0px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: scroll;
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }
    .text {
        margin: auto;
    }
    h1, h2 {
        color: ${colors.gray50};
    }
    p {
        font-size: 22px;
    }
`;

export const Close = styled.div`
    svg {
        stroke: ${colors.gray50};
    }
    svg:hover {
        stroke: ${colors.red};
    }
`;
