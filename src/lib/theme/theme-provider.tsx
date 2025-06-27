import { colorScheme, vars } from 'nativewind';
import React, { createContext, use, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { COLORS } from '~/src/lib/theme/colors';

export const themes = {
  light: vars({
    '--background': '242 242 242',
    '--foreground': '9 9 9',
    '--card': '251 251 251',
    '--card-foreground': '15 15 15',
    '--popover': '240 240 240',
    '--popover-foreground': '15 15 15',
    '--primary': '0 0 0',
    '--primary-foreground': '247 247 247',
    '--secondary': '45 185 227',
    '--secondary-foreground': '12 72 90',
    '--muted': '209 209 209',
    '--muted-foreground': '102 102 102',
    '--accent': '255 40 84',
    '--accent-foreground': '255 153 174',
    '--destructive': '255 56 43',
    '--destructive-foreground': '255 255 255',
    '--border': '235 235 235',
    '--input': '212 212 212',
    '--ring': '235 235 235',

    '--android-background': '245 247 248',
    '--android-foreground': '4 5 6',
    '--android-card': '255 255 255',
    '--android-card-foreground': '0 8 16',
    '--android-popover': '236 244 252',
    '--android-popover-foreground': '0 8 16',
    '--android-primary': '0 111 231',
    '--android-primary-foreground': '240 247 255',
    '--android-secondary': '176 201 255',
    '--android-secondary-foreground': '0 32 102',
    '--android-muted': '209 215 221',
    '--android-muted-foreground': '65 76 88',
    '--android-accent': '169 73 204',
    '--android-accent-foreground': '217 175 233',
    '--android-destructive': '186 26 26',
    '--android-destructive-foreground': '255 255 255',
    '--android-border': '232 237 242',
    '--android-input': '202 214 226',
    '--android-ring': '232 237 242',

    '--web-background': '245 246 248',
    '--web-foreground': '4 5 6',
    '--web-card': '255 255 255',
    '--web-card-foreground': '0 8 16',
    '--web-popover': '236 244 252',
    '--web-popover-foreground': '0 8 16',
    '--web-primary': '0 110 227',
    '--web-primary-foreground': '240 247 255',
    '--web-secondary': '176 201 255',
    '--web-secondary-foreground': '0 32 102',
    '--web-muted': '215 221 228',
    '--web-muted-foreground': '62 75 91',
    '--web-accent': '169 73 204',
    '--web-accent-foreground': '217 175 233',
    '--web-destructive': '186 26 26',
    '--web-destructive-foreground': '255 255 255',
    '--web-border': '232 237 242',
    '--web-input': '202 214 226',
    '--web-ring': '232 237 242',
  }),
  dark: vars({
    '--background': '5 5 5',
    '--foreground': '246 246 246',
    '--card': '26 26 26',
    '--card-foreground': '246 246 246',
    '--popover': '38 38 38',
    '--popover-foreground': '246 246 246',
    '--primary': '143 143 143',
    '--primary-foreground': '0 0 0',
    '--secondary': '45 184 226',
    '--secondary-foreground': '13 72 89',
    '--muted': '94 94 94',
    '--muted-foreground': '196 196 196',
    '--accent': '255 40 84',
    '--accent-foreground': '255 153 174',
    '--destructive': '254 67 54',
    '--destructive-foreground': '255 255 255',
    '--border': '59 59 59',
    '--input': '71 71 71',
    '--ring': '59 59 59',

    '--android-background': '0 2 5',
    '--android-foreground': '246 250 255',
    '--android-card': '18 29 42',
    '--android-card-foreground': '246 250 255',
    '--android-popover': '37 42 48',
    '--android-popover-foreground': '246 250 255',
    '--android-primary': '43 145 255',
    '--android-primary-foreground': '0 0 0',
    '--android-secondary': '176 201 255',
    '--android-secondary-foreground': '0 32 102',
    '--android-muted': '209 215 221',
    '--android-muted-foreground': '65 76 88',
    '--android-accent': '176 92 207',
    '--android-accent-foreground': '217 176 232',
    '--android-destructive': '147 0 10',
    '--android-destructive-foreground': '255 255 255',
    '--android-border': '55 63 71',
    '--android-input': '67 75 85',
    '--android-ring': '55 63 71',

    '--web-background': '0 2 5',
    '--web-foreground': '246 250 255',
    '--web-card': '18 29 42',
    '--web-card-foreground': '246 250 255',
    '--web-popover': '37 42 48',
    '--web-popover-foreground': '246 250 255',
    '--web-primary': '40 144 255',
    '--web-primary-foreground': '0 0 0',
    '--web-secondary': '176 201 255',
    '--web-secondary-foreground': '0 32 102',
    '--web-muted': '215 221 228',
    '--web-muted-foreground': '62 75 91',
    '--web-accent': '176 92 207',
    '--web-accent-foreground': '217 176 232',
    '--web-destructive': '147 0 10',
    '--web-destructive-foreground': '255 255 255',
    '--web-border': '55 63 70',
    '--web-input': '67 75 85',
    '--web-ring': '55 63 70',
  }),
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Exclude<Theme, 'system'>) => void;
  colors: (typeof COLORS)['dark'] | (typeof COLORS)['light'];
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {
    throw new Error('toggleTheme must be used within a ThemeProvider');
  },
  setTheme: () => {
    throw new Error('setTheme must be used within a ThemeProvider');
  },
  colors: COLORS.light,
});

export type Theme = Parameters<typeof colorScheme.set>[0];

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<Exclude<Theme, 'system'>>('light');

  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    colorScheme.set(newTheme);
  }, [currentTheme]);

  const setTheme = useCallback((theme: Exclude<Theme, 'system'>) => {
    setCurrentTheme(theme);
    colorScheme.set(theme);
  }, []);

  const value = useMemo(
    () => ({ theme: currentTheme, toggleTheme, setTheme, colors: COLORS[currentTheme] }),
    [currentTheme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext value={value}>
      <View style={themes[currentTheme]} className="flex-1">
        {children}
      </View>
    </ThemeContext>
  );
};

export const useTheme = () => {
  const context = use(ThemeContext);
  return context;
};
