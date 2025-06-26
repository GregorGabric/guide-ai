import { Platform } from 'react-native';

const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(254, 243, 199)',
    grey5: 'rgb(254, 215, 170)',
    grey4: 'rgb(251, 191, 143)',
    grey3: 'rgb(249, 168, 116)',
    grey2: 'rgb(245, 137, 89)',
    grey: 'rgb(251, 146, 60)',
    background: 'rgb(250, 248, 246)',
    foreground: 'rgb(41, 37, 36)',
    root: 'rgb(250, 248, 246)',
    card: 'rgb(255, 251, 235)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(251, 146, 60)',
    secondary: 'rgb(20, 184, 166)',
  },
  dark: {
    grey6: 'rgb(68, 64, 60)',
    grey5: 'rgb(87, 83, 78)',
    grey4: 'rgb(120, 113, 108)',
    grey3: 'rgb(161, 161, 170)',
    grey2: 'rgb(212, 212, 216)',
    grey: 'rgb(228, 228, 231)',
    background: 'rgb(12, 10, 9)',
    foreground: 'rgb(250, 204, 21)',
    root: 'rgb(12, 10, 9)',
    card: 'rgb(41, 37, 36)',
    destructive: 'rgb(248, 113, 113)',
    primary: 'rgb(251, 146, 60)',
    secondary: 'rgb(45, 212, 191)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(254, 243, 199)',
    grey5: 'rgb(254, 215, 170)',
    grey4: 'rgb(251, 191, 143)',
    grey3: 'rgb(249, 168, 116)',
    grey2: 'rgb(245, 137, 89)',
    grey: 'rgb(245, 101, 101)',
    background: 'rgb(250, 248, 246)',
    foreground: 'rgb(41, 37, 36)',
    root: 'rgb(250, 248, 246)',
    card: 'rgb(255, 251, 235)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(245, 101, 101)',
    secondary: 'rgb(6, 182, 212)',
  },
  dark: {
    grey6: 'rgb(68, 64, 60)',
    grey5: 'rgb(87, 83, 78)',
    grey4: 'rgb(120, 113, 108)',
    grey3: 'rgb(161, 161, 170)',
    grey2: 'rgb(212, 212, 216)',
    grey: 'rgb(228, 228, 231)',
    background: 'rgb(12, 10, 9)',
    foreground: 'rgb(252, 211, 77)',
    root: 'rgb(12, 10, 9)',
    card: 'rgb(41, 37, 36)',
    destructive: 'rgb(248, 113, 113)',
    primary: 'rgb(245, 101, 101)',
    secondary: 'rgb(34, 211, 238)',
  },
} as const;

const WEB_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(254, 243, 199)',
    grey5: 'rgb(254, 215, 170)',
    grey4: 'rgb(251, 191, 143)',
    grey3: 'rgb(249, 168, 116)',
    grey2: 'rgb(245, 137, 89)',
    grey: 'rgb(249, 115, 22)',
    background: 'rgb(250, 248, 246)',
    foreground: 'rgb(41, 37, 36)',
    root: 'rgb(250, 248, 246)',
    card: 'rgb(255, 251, 235)',
    destructive: 'rgb(239, 68, 68)',
    primary: 'rgb(249, 115, 22)',
    secondary: 'rgb(14, 165, 233)',
  },
  dark: {
    grey6: 'rgb(68, 64, 60)',
    grey5: 'rgb(87, 83, 78)',
    grey4: 'rgb(120, 113, 108)',
    grey3: 'rgb(161, 161, 170)',
    grey2: 'rgb(212, 212, 216)',
    grey: 'rgb(228, 228, 231)',
    background: 'rgb(12, 10, 9)',
    foreground: 'rgb(253, 224, 71)',
    root: 'rgb(12, 10, 9)',
    card: 'rgb(41, 37, 36)',
    destructive: 'rgb(248, 113, 113)',
    primary: 'rgb(249, 115, 22)',
    secondary: 'rgb(56, 189, 248)',
  },
} as const;

const COLORS =
  Platform.OS === 'ios'
    ? IOS_SYSTEM_COLORS
    : Platform.OS === 'android'
      ? ANDROID_COLORS
      : WEB_COLORS;

export { COLORS };
