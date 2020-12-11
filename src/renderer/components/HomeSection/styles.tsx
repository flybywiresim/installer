import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  font-size: 50px;
  color: white;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://i.redd.it/c9vrznvyz4r51.png');
  background-color: #1C1C1C;
  background-size: cover;
  padding-left: 60px;
  padding-top: 40px;

  img {
    height: 100px;
  }

  span {
    font-size: 95px;
    font-weight: 100;
  }

`;

export const LogoAndText = styled.div`
  display: flex;
  align-items:baseline;
  margin: 1rem;
`;

export const DescAndImages = styled.div`
  p {
    font-size: 15px;
    color: #ada5a3;
    width: 800px;
  }
`;

export const Images = styled.div`
      margin-top: 140px;
      display: flex;
`;

export const Image = styled.div`
  height: 350px;
  width: 670px;
  background-image: url('https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png');
  background-size: cover;
  margin-right: 35px;
`;
