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
    height: 285px;
    width: 100%;
    margin-top: 47px;
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
    width: 700px;
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
        color: #ffffffdd;
        font-size: 20px;
    }
    .button {
        display: inline-block;
        margin: auto;
        color: #ffffffdd;
        font-size: 20px;
        cursor: pointer;
        text-decoration: underline;
        :hover {
            color: #00C2CB;
        }
    }
    h1 {
        margin-left: auto;
        font-size: 30px;
    }
    h2 {
        margin-left: auto;
        color: #00c2cb;
    }
    p {
        margin-left: auto;
        font-size: 20px;
        color: #ffffffdd;
    }
    strong {
        color: white;
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
    width: 120px;
    height: 40px;
    margin: 358px;
    margin-left: 403px;
    overflow: hidden;
    user-select: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    border: 2px solid #00C2CB;
    border-radius: 5px !important;
    :hover {
        background-color:#00C2CB;
        color: ${colors.cardBackground};
        border: 2px solid #00C2CB;
    }
`;
export const Cancel = styled.div`
    display: flex;
    justify-content: center;
    align-self: flex-start;
    align-items: center;
    position:fixed;
    width: 100px;
    height: 40px;
    margin: 358px;
    margin-left: 548px;
    overflow: hidden;
    user-select: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    border: 2px solid white;
    border-radius: 5px !important;
    :hover { 
        border: 2px solid #fc3a3a;
    }
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
