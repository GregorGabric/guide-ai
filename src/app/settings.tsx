import { useAuthActions } from '@convex-dev/auth/react';
import { IconChevronRight, IconLogout, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/src/components/ui/button';
import { ScrollView } from '~/src/components/ui/scroll-view';
import { LanguageSelect } from '~/src/features/settings/components/language-select';
import { ThemeSelector } from '~/src/features/settings/components/theme-selector';

import { H2, Large, P } from '~/src/components/ui/typography';
import { useColorScheme } from '~/src/lib/useColorScheme';

export default function SettingsModal() {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const { signOut } = useAuthActions();

  const handleClose = () => {
    router.back();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6">
        <View
          className="flex-row items-center justify-between py-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          <H2>Settings</H2>
          <Button
            variant="plain"
            size="icon"
            onPress={handleClose}
            className="h-8 w-8 rounded-full"
          >
            <IconX size={20} className="text-text-secondary" />
          </Button>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="mb-8">
            <P className="mb-4">Preferences</P>

            <View className="gap-2">
              <View
                style={{ borderCurve: 'continuous' }}
                className=" border-border/30 rounded-2xl border bg-card p-1"
              >
                <View className="p-4">
                  <ThemeSelector />
                </View>
              </View>
              <LanguageSelect className="w-full bg-card" />
            </View>
          </View>

          <View className="mb-8">
            <P className="mb-4">Other</P>

            <View
              style={{ borderCurve: 'continuous' }}
              className=" border-border/30 overflow-hidden rounded-2xl border bg-card"
            >
              {/* <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Notifications</Large>
                    <P>Push notifications</P>
                  </View>
                  <View className="flex-row items-center">
                    <View className="mr-3 rounded-full bg-green-500/10 px-3 py-2">
                      <P className="text-sm text-green-600">On</P>
                    </View>
                    <IconChevronRight size={20} color={colors.foreground} />
                  </View>
                </View>
              </TouchableOpacity> */}

              <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Privacy</Large>
                    <P>Data & privacy settings</P>
                  </View>
                  <IconChevronRight size={20} color={colors.foreground} />
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity activeOpacity={0.7} className="p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-text mb-1 text-lg">About</Text>
                    <Text className="text-text-secondary font-quicksand text-sm">
                      App version 1.0.0
                    </Text>
                  </View>
                  <IconChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity> */}
            </View>
          </View>

          <View className="mb-8">
            <Button size={'lg'} variant="destructive" onPress={handleSignOut}>
              <IconLogout size={20} color={colors.foreground} />
              <Text className="ml-3">Sign Out</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
