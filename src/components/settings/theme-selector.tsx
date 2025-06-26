import { IconDeviceMobile, IconMoon, IconSun } from '@tabler/icons-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/src/components/ui/text';
import { useColorScheme } from '~/src/lib/useColorScheme';

interface ThemeSelectorProps {
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleThemeSelect = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      // For system theme, we'll use the current system preference
      // This is a simplified implementation - in a real app you'd want to detect system theme
      void setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    } else {
      void setColorScheme(theme);
    }

    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

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

  const currentTheme = colorScheme;

  return (
    <View>
      {/* Section Header */}
      <View className="mb-4">
        <Text className="font-quicksand-bold text-text text-lg">Theme</Text>
        <Text className="text-text-secondary font-quicksand mt-0.5 text-sm">
          Choose your preferred theme
        </Text>
      </View>

      {/* Theme Options */}
      <View className="space-y-2">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const IconComponent = theme.icon;

          return (
            <TouchableOpacity
              key={theme.id}
              onPress={() => {
                handleThemeSelect(theme.id);
              }}
              className={`flex-row items-center justify-between rounded-xl p-3 ${
                isSelected ? 'bg-primary/10' : 'bg-transparent'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-1 flex-row items-center">
                <View className="mr-3">
                  <IconComponent
                    size={20}
                    color={isSelected ? '#6B7280' : '#9CA3AF'}
                    strokeWidth={2}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-quicksand-medium ${isSelected ? 'text-primary' : 'text-text'}`}
                  >
                    {theme.name}
                  </Text>
                  <Text className="text-text-secondary font-quicksand text-sm">
                    {theme.description}
                  </Text>
                </View>
              </View>

              {isSelected && <View className="h-2 w-2 rounded-full bg-primary" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
