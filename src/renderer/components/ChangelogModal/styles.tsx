import styled from 'styled-components';
import { colors } from 'renderer/style/theme';

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
    border-radius: 10px;
    user-select: none;
`;
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
`;

export const Modal = styled.div`
    background-color: ${colors.navyLighter};
    height: 450px;
    width: 700px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    color: ${colors.teal50};
    overflow: scroll;
    padding: 20px;

    img {
        height: 200px;
    }
    .text {
        margin: auto;
    }
    h1 {
        margin-left: auto;
        color: ${colors.gray50};
    }
    h2 {
        margin-left: auto;
        color: ${colors.gray50};
    }
    p {
        margin-left: auto;
        font-size: 22px;
    }
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
`;
export const Close = styled.div`
    display: flex;
    justify-content: center;
    align-self: flex-start;
    align-items: center;
    position:fixed;
    margin-left: 635px;
    width: 30px;
    height: 30px;
    overflow: hidden;
    user-select: none;
    color: ${colors.gray50};
    font-size: 20px;
    cursor: pointer;
    :hover { color: red;}
`;
