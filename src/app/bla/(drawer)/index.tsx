import { Stack } from 'expo-router';

import { Container } from '~/src/components/Container';
import { ScreenContent } from '~/src/components/ScreenContent';
import { Text } from '~/src/components/ui/text';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <Text className="font-sans text-4xl">Hello</Text>
        <ScreenContent path="app/(drawer)/index.tsx" title="Home" />
      </Container>
    </>
  );
}
