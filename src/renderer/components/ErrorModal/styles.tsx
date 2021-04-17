import styled from 'styled-components';
import { colors } from 'renderer/style/theme';

export const Close = styled.div`
    svg {
        stroke: ${colors.gray50};
    }
    svg:hover {
        stroke: ${colors.red};
    }
`;
