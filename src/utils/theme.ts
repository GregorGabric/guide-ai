// Theme constants for NativeWind v4
export const colors = {
  primary: '#007AFF',
  'primary-light': '#4DA6FF',
  'primary-dark': '#0051D5',
  secondary: '#FF6B6B',
  accent: '#4ECDC4',
  success: '#51CF66',
  warning: '#FFD93D',
  error: '#FF5252',
  background: '#F8F9FA',
  'card-background': '#FFFFFF',
  text: '#1A1A1A',
  'text-secondary': '#6B7280',
  'text-on-primary': '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
