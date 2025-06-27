import { useAuthActions } from '@convex-dev/auth/react';
import { IconChevronRight, IconLogout, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeSelector } from '~/src/components/settings/theme-selector';
import { Button } from '~/src/components/ui/button';
import { ScrollView } from '~/src/components/ui/scroll-view';
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
                className=" border-border/30 rounded-2xl border p-1"
              >
                <View className="p-4">
                  <ThemeSelector />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={{ borderCurve: 'continuous' }}
                className=" border-border/30 rounded-2xl border p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Voice</Large>
                    <P>AI assistant voice</P>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 mr-3 rounded-full px-3 py-2">
                      <P className="text-sm text-foreground">Natural</P>
                    </View>
                    <IconChevronRight size={20} color={colors.text} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={{ borderCurve: 'continuous' }}
                className=" border-border/30 rounded-2xl border p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Language</Large>
                    <P>Interface language</P>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 mr-3 rounded-full px-3 py-2">
                      <P className="text-sm text-foreground">English</P>
                    </View>
                    <IconChevronRight size={20} color={colors.text} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <P className="mb-4">Other</P>

            <View
              style={{ borderCurve: 'continuous' }}
              className=" border-border/30 overflow-hidden rounded-2xl border"
            >
              <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Notifications</Large>
                    <P>Push notifications</P>
                  </View>
                  <View className="flex-row items-center">
                    <View className="mr-3 rounded-full bg-green-500/10 px-3 py-2">
                      <P className="text-sm text-green-600">On</P>
                    </View>
                    <IconChevronRight size={20} color={colors.text} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} className="border-border/20 border-b p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Large className="mb-1">Privacy</Large>
                    <P>Data & privacy settings</P>
                  </View>
                  <IconChevronRight size={20} color={colors.text} />
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignOut}
              style={{ borderCurve: 'continuous' }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
            >
              <View className="flex-row items-center justify-center">
                <IconLogout size={20} color={colors.error} />
                <Large className="ml-3 text-red-500">Sign Out</Large>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
