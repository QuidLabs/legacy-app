import { DefaultTheme } from 'styled-components'

// TODO: get actual colors from https://github.com/vigorstablecoin/media/blob/master/readme-images/vigor-color-palette.jpg
const white = '#ffffff';
const whiteDarkened = '#DDDEE0';

const bg = '#13161E';
const bgLight = '#1E212E';
const bgLighter = '#2F3347';
const bgLightest = '#50587A';

const gray = `#a4a5aa`;
const primary = '#4468CC';
const primaryLighter = '#5981F0';

const secondary = '#6DE4F0';
const secondaryLighter = '#8AE9F3';
const tertiary = '#009AFF';
const light = '#949EA8';

const success = '#4ECCAE';
const error = '#E14852';
const warning = '#F6D051';
const danger = '#f69351';

const colors = {
  bg,
  bgLight,
  bgLighter,
  bgLightest,
  gray,
  white,
  whiteDarkened,
  primary,
  primaryLighter,
  secondary,
  secondaryLighter,
  tertiary,
  light,
  success,
  error,
  warning,
  danger,
};

const breakpoints = {
  xs: 492,
  sm: 720,
  smd: 850,
  md: 996,
  lg: 1216,
  xl: 1720
};

const theme: DefaultTheme = {
  borderRadius: '4px',
  borderRadius2x: '8px',
  colors,
  breakpoints,
};

export default theme;
