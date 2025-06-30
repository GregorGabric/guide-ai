import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { DimensionValue } from 'react-native';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '~/src/components/ui/text';
import { cn } from '~/src/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
}

export function Skeleton({ className, width = '100%', height = 20 }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.set(
      withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ width, height }}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
          className={cn('rounded-md', className)}
        />
      </Animated.View>
    </View>
  );
}

export function HistoricalSignificanceSkeleton({ sectionTitle }: { sectionTitle: string }) {
  return (
    <View className="mb-6">
      {/* Section Title */}
      <Text className="mb-4 text-xl font-semibold">{sectionTitle}</Text>

      {/* Introductory paragraph skeleton */}
      <View className="mb-6 gap-4">
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="85%" height={16} />
      </View>

      {/* Historical Significance Items Skeleton */}
      <View className="gap-4">
        {[1, 2, 3, 4].map((index) => (
          <View key={index} className="flex-row items-center justify-between gap-4">
            {/* Left side - Icon and title */}
            <View className="flex-1 flex-row items-center gap-4">
              <Skeleton width={24} height={24} className="rounded-sm" />
              <View className="flex-1 gap-2">
                <Skeleton width="90%" height={18} className="mb-2" />
                <View className="flex-row items-center gap-2">
                  <Skeleton width={60} height={20} className="rounded-full" />
                  <View className="flex-row items-center gap-1">
                    <Skeleton width={16} height={16} className="rounded-sm" />
                    <Skeleton width={30} height={16} />
                  </View>
                </View>
              </View>
            </View>

            {/* Right side - Chevron */}
            <Skeleton width={20} height={20} className="rounded-sm" />
          </View>
        ))}
      </View>
    </View>
  );
}
