import { Platform } from 'react-native';

const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(249, 249, 249)',
    grey5: 'rgb(239, 239, 239)',
    grey4: 'rgb(228, 228, 228)',
    grey3: 'rgb(213, 213, 213)',
    grey2: 'rgb(183, 183, 182)',
    grey: 'rgb(162, 162, 162)',
    background: 'rgb(248, 248, 248)',
    foreground: 'rgb(3, 3, 3)',
    root: 'rgb(248, 248, 248)',
    card: 'rgb(248, 248, 248)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(152, 152, 148)',
  },
  dark: {
    grey6: 'rgb(28, 28, 28)',
    grey5: 'rgb(46, 46, 46)',
    grey4: 'rgb(59, 59, 59)',
    grey3: 'rgb(79, 79, 79)',
    grey2: 'rgb(123, 123, 123)',
    grey: 'rgb(161, 161, 161)',
    background: 'rgb(2, 2, 1)',
    foreground: 'rgb(252, 252, 252)',
    root: 'rgb(2, 2, 1)',
    card: 'rgb(2, 2, 1)',
    destructive: 'rgb(254, 67, 54)',
    primary: 'rgb(152, 152, 148)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(251, 251, 250)',
    grey5: 'rgb(246, 246, 245)',
    grey4: 'rgb(240, 240, 240)',
    grey3: 'rgb(238, 238, 238)',
    grey2: 'rgb(235, 235, 235)',
    grey: 'rgb(233, 233, 233)',
    background: 'rgb(252, 252, 252)',
    foreground: 'rgb(10, 10, 10)',
    root: 'rgb(252, 252, 252)',
    card: 'rgb(252, 252, 252)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(152, 152, 148)',
  },
  dark: {
    grey6: 'rgb(29, 29, 29)',
    grey5: 'rgb(36, 36, 36)',
    grey4: 'rgb(42, 42, 41)',
    grey3: 'rgb(47, 47, 46)',
    grey2: 'rgb(49, 49, 49)',
    grey: 'rgb(54, 54, 54)',
    background: 'rgb(24, 24, 24)',
    foreground: 'rgb(230, 230, 230)',
    root: 'rgb(24, 24, 24)',
    card: 'rgb(24, 24, 24)',
    destructive: 'rgb(147, 0, 10)',
    primary: 'rgb(152, 152, 148)',
  },
} as const;

const WEB_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(250, 252, 255)',
    grey5: 'rgb(243, 247, 251)',
    grey4: 'rgb(236, 242, 248)',
    grey3: 'rgb(233, 239, 247)',
    grey2: 'rgb(229, 237, 245)',
    grey: 'rgb(226, 234, 243)',
    background: 'rgb(250, 252, 255)',
    foreground: 'rgb(27, 28, 29)',
    root: 'rgb(250, 252, 255)',
    card: 'rgb(250, 252, 255)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(0, 112, 233)',
  },
  dark: {
    grey6: 'rgb(25, 30, 36)',
    grey5: 'rgb(31, 38, 45)',
    grey4: 'rgb(35, 43, 52)',
    grey3: 'rgb(38, 48, 59)',
    grey2: 'rgb(40, 51, 62)',
    grey: 'rgb(44, 56, 68)',
    background: 'rgb(24, 28, 32)',
    foreground: 'rgb(221, 227, 233)',
    root: 'rgb(24, 28, 32)',
    card: 'rgb(24, 28, 32)',
    destructive: 'rgb(147, 0, 10)',
    primary: 'rgb(0, 69, 148)',
  },
} as const;

const COLORS =
  Platform.OS === 'ios'
    ? IOS_SYSTEM_COLORS
    : Platform.OS === 'android'
    ? ANDROID_COLORS
    : WEB_COLORS;

export { COLORS };
