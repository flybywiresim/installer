import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  font-size: 50px;
  color: white;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://flybywiresim-packages.nyc3.cdn.digitaloceanspaces.com/assets/installer/a32nx-background-2.jpg');
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
    max-width: 800px;
  }
`;
