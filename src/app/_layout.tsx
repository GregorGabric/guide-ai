import { Sora_400Regular, useFonts } from '@expo-google-fonts/sora';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { Theme } from '@react-navigation/native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import type { SQLiteDatabase } from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '~/global.css';
import '~/polyfills';
import { OnboardingWrapper } from '~/src/components/onboarding-wrapper';
import { ConvexClientProvider } from '~/src/context/convex-provider';
import { QueryProvider } from '~/src/context/query-context';
import { NAV_THEME } from '~/src/lib/constants';
import { useColorScheme } from '~/src/lib/useColorScheme';

void SplashScreen.preventAutoHideAsync();

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme: _colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  const [loaded, error] = useFonts({
    Sora_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }

    if (hasMounted.current) {
      return;
    }

    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, [loaded, error]);

  if (!isColorSchemeLoaded || !loaded || error) {
    return null;
  }

  return (
    <SQLiteProvider databaseName="audio-cache.db" onInit={initDb}>
      <ConvexClientProvider>
        <QueryProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <KeyboardProvider>
                <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                  <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                  <OnboardingWrapper>
                    <Stack>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen
                        name="modal"
                        options={{ title: 'Modal', presentation: 'modal' }}
                      />
                    </Stack>
                  </OnboardingWrapper>
                </ThemeProvider>
              </KeyboardProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </QueryProvider>
      </ConvexClientProvider>
    </SQLiteProvider>
  );
}

async function initDb(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE IF NOT EXISTS audio_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cache_key TEXT NOT NULL UNIQUE,
  audio TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_audio_cache_key ON audio_cache(cache_key);
`);
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
