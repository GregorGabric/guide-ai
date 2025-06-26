import { IconCamera, IconMap, IconWorld } from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import { colors } from '~/src/utils/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        animation: 'fade',
        tabBarStyle: {
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="visited"
        options={{
          freezeOnBlur: true,
          animation: 'fade',
          title: 'Visited',
          tabBarIcon: ({ color }) => <IconWorld color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          freezeOnBlur: true,
          title: 'Discover',
          tabBarIcon: ({ color }) => <IconMap color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          freezeOnBlur: true,
          animation: 'fade',
          title: 'Camera',
          tabBarIcon: ({ color }) => <IconCamera color={color} />,
        }}
      />
    </Tabs>
  );
}
