import styled from 'styled-components';
import { colors } from 'renderer/style/theme';

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    z-index: 1;
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
    background-color: #313131;
    height: 70%;
    width: 100%;
    margin-top: 50px;
    border-radius: 10px;
    color: #fff;
    overflow: scroll;
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
`;

export const Modal = styled.div`
    background-color:  ${colors.cardBackground};
    height: 450px;
    width: 800px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    color: #fff;
    overflow: scroll;
    padding: 25px;
    padding-left: 25px;
    padding-right: 25px:

    img {
        height: 200px;
    }
    .text {
        margin: auto;
        color: #fff;
    }
    h1 {
        margin-left: auto;
        font-size: 40px;
    }
    h2 {
        margin-left: auto;
        color: #00c2cb;
    }
    p {
        margin-left: auto;
        font-size: 20px;
    }
    strong {
        font-size: 24px;
    }
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
`;
export const Continue = styled.div`
    display: flex;
    justify-content: center;
    align-self: flex-start;
    align-items: center;
    position:fixed;
    width: 100px;
    margin: 363px;
    margin-left: 525px;
    overflow: hidden;
    user-select: none;
    color: white;
    background-color: #00C2CB;
    font-size: 20px;
    cursor: pointer;
    border: 2px solid #00C2CB;
    border-radius: 5px !important;
`;
export const Cancel = styled.div`
    display: flex;
    justify-content: center;
    align-self: flex-start;
    align-items: center;
    position:fixed;
    width: 100px;
    margin: 363px;
    margin-left: 650px;
    overflow: hidden;
    user-select: none;
    color: white;
    background-color: #fc3a3a;
    font-size: 20px;
    cursor: pointer;
    border: 2px solid #fc3a3a;
    border-radius: 5px !important;
`;
export const Title = styled.div`
    display: flex;
    justify-content: center;
    align-self: flex-start;
    align-items: center;
    position:fixed;
    margin: 0;
    line-height: 80%;
    overflow: hidden;
    user-select: none;
    color: white;
    font-size: 40px;
`;
