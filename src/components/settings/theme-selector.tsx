import { IconDeviceMobile, IconMoon, IconSun } from '@tabler/icons-react-native';
import { Appearance, View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { H2, H3, P } from '~/src/components/ui/typography';
import { useTheme } from '~/src/lib/theme/theme-provider';
import { cn } from '~/src/lib/utils';

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
  const { theme, setTheme, colors } = useTheme();

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
              className={cn(
                'flex-row items-center justify-between rounded-xl p-3',
                isSelected ? 'bg-primary' : 'bg-transparent'
              )}
              size={'lg'}
            >
              <View className="flex-1 flex-row items-center">
                <View className="mr-3">
                  <IconComponent
                    size={20}
                    color={isSelected ? colors.background : colors.primary}
                    strokeWidth={2}
                  />
                </View>
                <View className="flex-1">
                  <H3 className={cn(isSelected ? 'text-background' : 'text-foreground')}>
                    {theme.name}
                  </H3>
                  <P className={cn(isSelected ? 'text-background' : 'text-muted-foreground')}>
                    {theme.description}
                  </P>
                </View>
              </View>
            </Button>
          );
        })}
      </View>
    </View>
  );
}
