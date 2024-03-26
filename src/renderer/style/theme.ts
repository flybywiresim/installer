import { css } from 'styled-components';

export const fontSizes = {
  huge: '20px',
};

export const colors = {
  positive: '#00b853',
  red: '#fc3a3a',
  redDark: '#F70404',
  redDarker: '#E40303',
  redDarkest: '#D10303',

  title: '#FFFFFFDD',
  titleContrast: '#FFFFFF',

  mutedText: '#929292',
  mutedTextDark: '#666666',

  listItem: '#393939',
  listItemSelected: '#474747',

  cardBackground: '#313131',
  cardBackgroundHover: '#3b3b3b',
  cardForeground: '#FFFFFFDD',
  cardSelected: '#00C2CB',
  cardInstalled: '#2E995E',

  gray50: '#f9fafb',
  navy: '#1b2434',
  navyLightest: '#273347',
  navyLighter: '#222c3d',
  navy400: '#1f2633',
  teal50: '#c2cbcc',
  tealLight: '#00c2cc',
  tealLightContrast: '#00afb7',
};

export const dropShadow = css`
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.25));
`;

export const smallCard = css`
  padding: 0.5em 1.15em;
  border-radius: 5px;

  background-color: ${colors.cardBackground};
  &:hover {
    background-color: ${colors.cardBackgroundHover};
  }
  color: ${colors.cardForeground};

  transition: background-color linear 200ms;

  ${dropShadow};
`;
