import { css } from "styled-components";

export const fontSizes = {
    huge: '20px',
};

export const colors = {
    positive: '#00b853',

    title: '#FFFFFFDD',
    titleContrast: '#FFFFFF',

    mutedText: '#929292',

    cardBackground: '#313131',
    cardBackgroundHover: '#3b3b3b',
    cardForeground: '#FFFFFFDD',
};

export const dropShadow = css`
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.25));
`;

export const smallCard = css`
  padding: .5em 1.15em;
  border-radius: 5px;

  background-color: ${colors.cardBackground};
  &:hover {
    background-color: ${colors.cardBackgroundHover};
  }
  color: ${colors.cardForeground};

  transition: background-color linear 200ms;
  
  ${dropShadow};
`;

export const noPadding = css`
  padding: 0;
  margin: 0;
`;
