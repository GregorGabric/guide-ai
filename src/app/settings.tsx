import { router } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeSelector } from '~/src/components/settings/theme-selector';
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { H2 } from '~/src/components/ui/typography';

export default function SettingsModal() {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* Header */}
        <View
          className="flex-row items-center justify-between py-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          <H2 className="font-quicksand-bold text-text">Settings</H2>
          <Button
            variant="plain"
            size="icon"
            onPress={handleClose}
            className="h-8 w-8 rounded-full"
          >
            <X size={20} className="text-text-secondary" />
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

            <TouchableOpacity
              activeOpacity={0.7}
              style={{ borderCurve: 'continuous' }}
              className="bg-surface border-border/30 rounded-2xl border p-5"
            >
              <View className="flex-row items-center">
                <View className="bg-primary/20 mr-4 h-12 w-12 items-center justify-center rounded-full">
                  <Text className="font-quicksand-bold text-lg text-primary">U</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-text text-lg">User</Text>
                  <Text className="text-text-secondary font-quicksand mt-0.5 text-sm">
                    Tap to edit profile
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View className="mb-8">
            <Text className="text-text-secondary font-quicksand-medium mb-4 text-sm uppercase tracking-wide">
              Preferences
            </Text>

            <View className="space-y-4">
              {/* Theme Setting - Enhanced */}
              <View
                style={{ borderCurve: 'continuous' }}
                className="bg-surface border-border/30 rounded-2xl border p-1"
              >
                <View className="p-4">
                  <ThemeSelector />
                </View>
              </View>

              {/* Voice ID Setting - Interactive */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ borderCurve: 'continuous' }}
                className="bg-surface border-border/30 rounded-2xl border p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">Voice</Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      AI assistant voice
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 mr-3 rounded-full px-3 py-2">
                      <Text className="font-quicksand-medium text-sm text-primary">Natural</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Language Setting - Interactive */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ borderCurve: 'continuous' }}
                className="bg-surface border-border/30 rounded-2xl border p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">Language</Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      Interface language
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 mr-3 rounded-full px-3 py-2">
                      <Text className="font-quicksand-medium text-sm text-primary">English</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Other Settings Section */}
          <View className="mb-8">
            <Text className="text-text-secondary font-quicksand-medium mb-4 text-sm uppercase tracking-wide">
              Other
            </Text>

            <View
              style={{ borderCurve: 'continuous' }}
              className="bg-surface border-border/30 overflow-hidden rounded-2xl border"
            >
              {/* Notifications */}
              <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">
                      Notifications
                    </Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      Push notifications
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="mr-3 rounded-full bg-green-500/10 px-3 py-2">
                      <Text className="font-quicksand-medium text-sm text-green-600">On</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Privacy */}
              <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">Privacy</Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      Data & privacy settings
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* About */}
              <TouchableOpacity activeOpacity={0.7} className="p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">About</Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      App version 1.0.0
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
