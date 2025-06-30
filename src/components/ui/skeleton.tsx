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
      {/* Section Title Skeleton */}
      {/* <Skeleton width={180} height={20} className="mb-4"> */}
      <Text>{sectionTitle}</Text>
      {/* </Skeleton> */}

      {/* Summary Skeleton */}
      <View className="mb-4 rounded-3xl border border-border bg-card p-5">
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="90%" height={16} className="mb-2" />
        <Skeleton width="95%" height={16} />
      </View>

      {/* Historical Significance Cards Skeleton */}
      <View className="space-y-3">
        {[1, 2, 3].map((index) => (
          <View key={index} className="overflow-hidden rounded-3xl border border-border bg-card">
            <View className="p-5">
              {/* Header with significance type and score */}
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Skeleton width={32} height={32} className="rounded-full" />
                  <Skeleton width={80} height={20} className="rounded-full" />
                </View>
                <View className="flex-row items-center gap-1">
                  <Skeleton width={16} height={16} className="rounded-sm" />
                  <Skeleton width={30} height={16} />
                </View>
              </View>

              {/* Title */}
              <Skeleton width="85%" height={18} className="mb-2" />

              {/* Period */}
              <View className="mb-3 flex-row items-center gap-2">
                <Skeleton width={14} height={14} className="rounded-sm" />
                <Skeleton width={120} height={14} />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Skeleton width="100%" height={16} className="mb-2" />
                <Skeleton width="100%" height={16} className="mb-2" />
                <Skeleton width="75%" height={16} />
              </View>

              {/* Related Events */}
              <View className="mb-3">
                <Skeleton width={100} height={12} className="mb-2" />
                <View className="mb-1 flex-row items-start gap-2">
                  <Skeleton width={6} height={6} className="mt-1 rounded-full" />
                  <Skeleton width="90%" height={12} />
                </View>
                <View className="flex-row items-start gap-2">
                  <Skeleton width={6} height={6} className="mt-1 rounded-full" />
                  <Skeleton width="85%" height={12} />
                </View>
              </View>

              {/* Key Figures */}
              <View>
                <Skeleton width={80} height={12} className="mb-2" />
                <View className="flex-row flex-wrap gap-2">
                  <Skeleton width={60} height={20} className="rounded-full" />
                  <Skeleton width={80} height={20} className="rounded-full" />
                  <Skeleton width={70} height={20} className="rounded-full" />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
