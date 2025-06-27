import { IconDeviceMobile, IconMoon, IconSun } from '@tabler/icons-react-native';
import { Appearance, View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { H2, H3, P } from '~/src/components/ui/typography';
import { useTheme } from '~/src/lib/theme/theme-provider';
import { colors } from '~/src/utils/theme';

const themes = [
  {
    id: 'light' as const,
    name: 'Light',
    description: 'Light theme',
    icon: IconSun,
  },
  {
    id: 'dark' as const,
    name: 'Dark',
    description: 'Dark theme',
    icon: IconMoon,
  },
  {
    id: 'system' as const,
    name: 'System',
    description: 'Follow system',
    icon: IconDeviceMobile,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const handleThemeSelect = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      const systemTheme = Appearance.getColorScheme();
      // For system theme, we'll use the current system preference
      // This is a simplified implementation - in a real app you'd want to detect system theme
      setTheme(systemTheme === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
  };

  const currentTheme = theme;

  return (
    <View>
      {/* Section Header */}
      <View className="mb-4">
        <H2>Theme</H2>
        <P>Choose your preferred theme</P>
      </View>

      {/* Theme Options */}
      <View className="space-y-2">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const IconComponent = theme.icon;

          return (
            <Button
              variant="primary"
              key={theme.id}
              onPress={() => {
                handleThemeSelect(theme.id);
              }}
              className={`flex-row items-center justify-between rounded-xl p-3 ${
                isSelected ? 'bg-primary' : 'bg-transparent'
              }`}
            >
              <View className="flex-1 flex-row items-center">
                <View className="mr-3">
                  <IconComponent
                    size={20}
                    color={isSelected ? colors['text-on-primary'] : colors.secondary}
                    strokeWidth={2}
                  />
                </View>
                <View className="flex-1">
                  <H3>{theme.name}</H3>
                  <P>{theme.description}</P>
                </View>
              </View>
            </Button>
          );
        })}
      </View>
    </View>
  );
}
