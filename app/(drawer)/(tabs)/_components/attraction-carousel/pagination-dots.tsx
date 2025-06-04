import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

type DotProps = {
  index: number;
  scrollOffsetX: SharedValue<number>;
};

const Dot: React.FC<DotProps> = ({ scrollOffsetX, index }) => {
  const { width: cardWidth } = useWindowDimensions();

  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * cardWidth,
      index * cardWidth,
      (index + 1) * cardWidth,
    ];

    const opacity = interpolate(
      scrollOffsetX.value,
      inputRange,
      [0.25, 1, 0.25],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      className="w-[5px] h-[5px] rounded-full bg-neutral-900"
      style={dotStyle}
    />
  );
};

interface PaginationDotsProps {
  numberOfItems: number;
  scrollOffsetX: SharedValue<number>;
}

export const PaginationDots = ({
  numberOfItems,
  scrollOffsetX,
}: PaginationDotsProps) => {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: numberOfItems }).map((_, index) => {
        return <Dot key={index} scrollOffsetX={scrollOffsetX} index={index} />;
      })}
    </View>
  );
};
