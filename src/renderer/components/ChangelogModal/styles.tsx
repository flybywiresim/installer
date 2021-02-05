import styled from 'styled-components';

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
    height: 100%;
    width: 96%;
    margin: auto;
    margin-left: 0px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    color: #fff;
    overflow: scroll;
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
`;

export const Modal = styled.div`
    background-color: #313131;
    height: 450px;
    width: 700px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    color: #fff;
    overflow: scroll;
    padding: 10px;

    img {
        height: 200px;
    }
    .text {
        margin: auto;
        color: #fff;
    }
    h1 {
        margin-left: auto;
    }
    h2 {
        margin-left: auto
    }
    p {
        margin-left: auto;
        font-size: 22px;
        color: #ffffff;
    }
    li {
        color: #ffffffdd;
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
    margin-left: 650px;
    width: 30px;
    height: 30px;
    overflow: hidden;
    user-select: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    :hover { color: red;}
`;
