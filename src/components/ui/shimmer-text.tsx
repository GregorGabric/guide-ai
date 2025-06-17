import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { EasingFunction, EasingFunctionFactory } from 'react-native-reanimated';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colorKit } from 'reanimated-color-picker';

type ShimmerTextProps = TextProps & {
  children: React.ReactNode;
  speed?: number;
  easing?: EasingFunction | EasingFunctionFactory;
  highlightColor?: string;
};

export const ShimmerText = ({
  children,
  speed = 0.6,
  easing = Easing.in(Easing.ease),
  highlightColor = '#ffffff',
  ...textProps
}: ShimmerTextProps) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const translateX = useSharedValue(-width);

  const duration = 1000 / speed;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  React.useEffect(() => {
    translateX.set(
      withRepeat(
        withSequence(withTiming(-width, { duration: 0 }), withTiming(width, { duration, easing })),
        -1,
        false
      )
    );
  }, [duration, easing, translateX, width]);

  const highlightColorTransparent = colorKit.setAlpha(highlightColor, 0).hex();

  return (
    <View>
      <Text
        style={textProps.style}
        className="pointer-events-none absolute left-0 top-0 self-start"
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setWidth(width);
          setHeight(height);
        }}
      >
        {children}
      </Text>
      <MaskedView
        style={{
          width,
          height,
        }}
        maskElement={
          <View className="bg-transparent">
            <Text style={textProps.style}>{children}</Text>
          </View>
        }
      >
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <LinearGradient
            colors={[
              highlightColorTransparent,
              highlightColor,
              highlightColor,
              highlightColorTransparent,
            ]}
            locations={[0, 0.4, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
};
