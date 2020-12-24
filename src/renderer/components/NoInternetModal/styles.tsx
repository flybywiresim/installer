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

export const Modal = styled.div`
    background-color: #313131;
    height: 450px;
    width: 700px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 10px;

    img {
        height: 200px;
    }

    p {
        color: #fff;
        font-size: 22px;
    }
`;
