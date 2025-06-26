import { IconX } from '@tabler/icons-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeSelector } from '~/src/components/settings/theme-selector';
import { Button } from '~/src/components/ui/button';
import { Sheet, type SheetRef } from '~/src/components/ui/sheet';
import { Text } from '~/src/components/ui/text';
import { H2 } from '~/src/components/ui/typography';

interface ProfileSettingsModalProps {
  sheetRef: SheetRef;
  onClose: () => void;
}

export function ProfileSettingsModal({ sheetRef, onClose }: ProfileSettingsModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet ref={sheetRef} snapPoints={['90%']} enablePanDownToClose>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <H2 className="font-quicksand-bold text-text">Settings</H2>
          <Button variant="plain" size="icon" onPress={onClose} className="h-8 w-8 rounded-full">
            <IconX size={20} className="text-text-secondary" />
          </Button>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Profile Section */}
          <View className="mb-8">
            <Text className="text-text-secondary font-quicksand-medium mb-4 text-sm uppercase tracking-wide">
              Profile
            </Text>

            <View className="bg-surface flex-row items-center space-x-4 rounded-2xl p-4">
              <View className="bg-primary/20 h-12 w-12 items-center justify-center rounded-full">
                <Text className="font-quicksand-bold text-lg text-primary">U</Text>
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-text text-lg">User</Text>
                <Text className="text-text-secondary font-quicksand text-sm">
                  Tap to edit profile
                </Text>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="mb-8">
            <Text className="text-text-secondary font-quicksand-medium mb-4 text-sm uppercase tracking-wide">
              Preferences
            </Text>

            <View className="space-y-6">
              {/* Theme Setting - Now Functional */}
              <ThemeSelector />

              {/* Voice ID Setting - Placeholder */}
              <View className="space-y-3">
                <Text className="text-text-secondary font-quicksand-medium text-sm uppercase tracking-wide">
                  Voice
                </Text>
                <View className="bg-surface rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-quicksand-medium text-text">Voice Selection</Text>
                      <Text className="text-text-secondary font-quicksand text-sm">
                        AI assistant voice
                      </Text>
                    </View>
                    <View className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="font-quicksand-medium text-sm text-primary">Natural</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Language Setting - Placeholder */}
              <View className="space-y-3">
                <Text className="text-text-secondary font-quicksand-medium text-sm uppercase tracking-wide">
                  Language
                </Text>
                <View className="bg-surface rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-quicksand-medium text-text">App Language</Text>
                      <Text className="text-text-secondary font-quicksand text-sm">
                        Interface language
                      </Text>
                    </View>
                    <View className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="font-quicksand-medium text-sm text-primary">English</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Other Settings Section */}
          <View className="mb-8">
            <Text className="text-text-secondary font-quicksand-medium mb-4 text-sm uppercase tracking-wide">
              Other
            </Text>

            <View className="bg-surface space-y-4 rounded-2xl p-4">
              {/* Notifications */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-medium text-text">Notifications</Text>
                  <Text className="text-text-secondary font-quicksand text-sm">
                    Push notifications
                  </Text>
                </View>
                <View className="rounded-full bg-green-500/10 px-3 py-1">
                  <Text className="font-quicksand-medium text-sm text-green-600">On</Text>
                </View>
              </View>

              {/* Privacy */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-medium text-text">Privacy</Text>
                  <Text className="text-text-secondary font-quicksand text-sm">
                    Data & privacy settings
                  </Text>
                </View>
              </View>

              {/* About */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-medium text-text">About</Text>
                  <Text className="text-text-secondary font-quicksand text-sm">
                    App version 1.0.0
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Sheet>
  );
}
