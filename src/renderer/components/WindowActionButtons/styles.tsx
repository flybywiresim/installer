import styled from 'styled-components';

export const Container = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    -webkit-app-region: none;
`;

interface ButtonProps {
    isClose?: boolean
}

export const Button = styled.div<ButtonProps>`
    height: 50px;
    width: 40px;
    color: #B9BBBE;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    font-size: 1em;

    :hover {
        background-color: ${props => props.isClose ? '#F04747' : '#282B2E' };
        color: white;
    }

`;
