import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '~/src/components/TabBarIcon';

export const TAB_BAR_HEIGHT = 75;
export default function TabLayout() {
  const { bottom: tabBarPaddingBottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#D9D9D9',
        tabBarInactiveTintColor: '#D9D9D9',
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          bottom: 0,
          elevation: 0,
          overflow: 'hidden',
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
          borderTopWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        tabBarBackground: () => (
          <Animated.View style={StyleSheet.absoluteFill}>
            <BlurView
              tint="systemMaterial"
              experimentalBlurMethod="dimezisBlurView"
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Animated.View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="visited"
        options={{
          animation: 'fade',
          title: 'Visited',
          tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
