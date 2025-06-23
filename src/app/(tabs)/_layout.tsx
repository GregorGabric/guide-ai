import { Tabs } from 'expo-router';
import { CameraIcon, GlobeIcon, MapIcon } from 'lucide-react-native';
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
          animation: 'fade',
          title: 'Visited',
          tabBarIcon: ({ color }) => <GlobeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          animation: 'fade',
          title: 'Camera',
          tabBarIcon: ({ color }) => <CameraIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
