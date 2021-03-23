import styled from 'styled-components';

export const Container = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    -webkit-app-region: none;
`;

interface ButtonProps {
    isClose?: boolean,
    className?: string
}

export const Button = styled.div<ButtonProps>`
    width: 40px;
    height: 100%;
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
