import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ConvexAuthProvider } from '@convex-dev/auth/react';
import type { ReactNode } from 'react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('EXPO_PUBLIC_CONVEX_URL environment variable is required');
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

interface Props {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: Props) {
  return (
    <ConvexAuthProvider
      client={convex}
      storage={Platform.OS === 'android' || Platform.OS === 'ios' ? secureStorage : undefined}
    >
      {children}
    </ConvexAuthProvider>
  );
}
