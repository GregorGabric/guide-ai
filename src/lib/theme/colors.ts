import { Platform } from 'react-native';

const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(245, 245, 245)',
    grey5: 'rgb(235, 235, 235)',
    grey4: 'rgb(224, 224, 224)',
    grey3: 'rgb(209, 209, 209)',
    grey2: 'rgb(179, 179, 179)',
    grey: 'rgb(158, 158, 158)',
    background: 'rgb(242, 242, 242)',
    foreground: 'rgb(9, 9, 9)',
    root: 'rgb(242, 242, 242)',
    card: 'rgb(242, 242, 242)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(0, 0, 0)',
  },
  dark: {
    grey6: 'rgb(27, 27, 27)',
    grey5: 'rgb(46, 46, 46)',
    grey4: 'rgb(59, 59, 59)',
    grey3: 'rgb(79, 79, 79)',
    grey2: 'rgb(122, 122, 122)',
    grey: 'rgb(161, 161, 161)',
    background: 'rgb(5, 5, 5)',
    foreground: 'rgb(246, 246, 246)',
    root: 'rgb(5, 5, 5)',
    card: 'rgb(5, 5, 5)',
    destructive: 'rgb(254, 67, 54)',
    primary: 'rgb(143, 143, 143)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(248, 248, 248)',
    grey5: 'rgb(237, 238, 239)',
    grey4: 'rgb(226, 227, 229)',
    grey3: 'rgb(210, 212, 214)',
    grey2: 'rgb(178, 181, 185)',
    grey: 'rgb(156, 161, 166)',
    background: 'rgb(245, 247, 248)',
    foreground: 'rgb(4, 5, 6)',
    root: 'rgb(245, 247, 248)',
    card: 'rgb(245, 247, 248)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(0, 111, 231)',
  },
  dark: {
    grey6: 'rgb(26, 27, 29)',
    grey5: 'rgb(44, 46, 48)',
    grey4: 'rgb(56, 59, 62)',
    grey3: 'rgb(75, 79, 83)',
    grey2: 'rgb(116, 122, 128)',
    grey: 'rgb(156, 160, 165)',
    background: 'rgb(0, 2, 5)',
    foreground: 'rgb(246, 250, 255)',
    root: 'rgb(0, 2, 5)',
    card: 'rgb(0, 2, 5)',
    destructive: 'rgb(147, 0, 10)',
    primary: 'rgb(43, 145, 255)',
  },
} as const;

const WEB_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(247, 248, 248)',
    grey5: 'rgb(237, 238, 239)',
    grey4: 'rgb(226, 227, 229)',
    grey3: 'rgb(210, 212, 214)',
    grey2: 'rgb(178, 181, 185)',
    grey: 'rgb(156, 161, 166)',
    background: 'rgb(245, 246, 248)',
    foreground: 'rgb(4, 5, 6)',
    root: 'rgb(245, 246, 248)',
    card: 'rgb(245, 246, 248)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(0, 110, 227)',
  },
  dark: {
    grey6: 'rgb(26, 27, 29)',
    grey5: 'rgb(44, 46, 48)',
    grey4: 'rgb(56, 59, 62)',
    grey3: 'rgb(75, 79, 83)',
    grey2: 'rgb(116, 122, 128)',
    grey: 'rgb(156, 160, 165)',
    background: 'rgb(0, 2, 5)',
    foreground: 'rgb(246, 250, 255)',
    root: 'rgb(0, 2, 5)',
    card: 'rgb(0, 2, 5)',
    destructive: 'rgb(147, 0, 10)',
    primary: 'rgb(40, 144, 255)',
  },
} as const;

const COLORS =
  Platform.OS === 'ios'
    ? IOS_SYSTEM_COLORS
    : Platform.OS === 'android'
      ? ANDROID_COLORS
      : WEB_COLORS;

export { COLORS };
