import { useAuthActions } from '@convex-dev/auth/react';
import { IconBrandGoogle, IconMap, IconMapPin, IconShield } from '@tabler/icons-react-native';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Platform, View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { ScrollView } from '~/src/components/ui/scroll-view';
import { Text } from '~/src/components/ui/text';
import { H2, Lead, P, Small } from '~/src/components/ui/typography';
import { useTheme } from '~/src/lib/theme/theme-provider';

const redirectTo = makeRedirectUri();

export function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuthActions();
  const handleSignIn = async () => {
    const { redirect } = await signIn('google', { redirectTo });
    if (Platform.OS === 'web') {
      return;
    }
    if (!redirect) {
      console.error('No redirect URL received from sign-in');
      return;
    }

    const result = await openAuthSessionAsync(redirect.toString(), redirectTo);

    if (result.type === 'success') {
      const { url } = result;

      const code = new URL(url).searchParams.get('code');
      if (!code) {
        console.error('No authorization code received');
        return;
      }

      try {
        await signIn('google', { code });
        router.replace('/');
      } catch (error) {
        console.error('Error signing in', error);
      }
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-1 items-center justify-center mb-40"
    >
      <LinearGradient
        colors={[
          'rgba(251, 146, 60, 0.02)',
          'rgba(20, 184, 166, 0.015)',
          'rgba(244, 63, 94, 0.02)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-12 items-center">
          <View className="bg-primary/10 border-primary/5 mb-8 h-20 w-20 items-center justify-center rounded-3xl border">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <IconMap size={24} color={colors.background} strokeWidth={2} />
            </View>
          </View>

          <H2 className="mb-4 text-center font-bold tracking-tight text-foreground">Guide AI</H2>

          <Lead className="mb-2 text-center font-medium text-muted-foreground">
            Your intelligent travel companion
          </Lead>

          <P className="max-w-xs text-center leading-7 text-muted-foreground">
            Discover amazing places and get personalized recommendations powered by AI
          </P>
        </View>

        <View className="w-full max-w-sm">
          <View className="mb-8">
            <Button
              onPress={handleSignIn}
              variant="primary"
              size="lg"
              className="h-14 w-full rounded-2xl shadow-lg"
            >
              <View className="flex-row items-center justify-center gap-4">
                <IconBrandGoogle size={20} color={colors.background} strokeWidth={2} />
                <Text className="text-lg font-semibold text-background">Continue with Google</Text>
              </View>
            </Button>
          </View>

          <View className="flex-row items-center justify-center gap-3">
            <IconShield size={16} className="text-muted-foreground" strokeWidth={2} />
            <P className="font-medium text-muted-foreground">Secure authentication with Google</P>
          </View>

          <Small className="px-4 text-center leading-6 text-muted-foreground">
            By continuing, you agree to our{' '}
            <Small className="font-medium text-primary">Terms of Service</Small> and{' '}
            <Small className="font-medium text-primary">Privacy Policy</Small>
          </Small>
        </View>

        <View className="absolute left-12 top-24">
          <IconMapPin size={32} color="rgba(251, 146, 60, 0.3)" strokeWidth={1.5} />
        </View>
        <View className="absolute bottom-32 right-12">
          <IconMapPin size={24} color="rgba(20, 184, 166, 0.4)" strokeWidth={1.5} />
        </View>
        <View className="absolute right-8 top-1/3">
          <IconMapPin size={16} color="rgba(244, 63, 94, 0.5)" strokeWidth={2} />
        </View>
        <View className="absolute bottom-1/4 left-8">
          <IconMapPin size={14} color="rgba(168, 85, 247, 0.4)" strokeWidth={2} />
        </View>
        <View className="absolute left-1/4 top-2/3">
          <IconMapPin size={12} color="rgba(34, 197, 94, 0.6)" strokeWidth={2} />
        </View>
      </View>
    </ScrollView>
  );
}
