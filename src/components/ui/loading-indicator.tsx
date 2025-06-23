import { BlurMask, Canvas, Path, Skia, SweepGradient, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const size = 128;
const strokeWidth = 10;
const radius = (size - strokeWidth) / 2;
const canvasSize = size + 30;

export const ActivityIndicator = () => {
  const progress = useSharedValue(0);

  // Animation setup

  useEffect(() => {
    const play = () => {
      progress.set(withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false));
    };
    play();
  }, [progress]);

  const rContainerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${2 * Math.PI * progress.value}rad` }],
  }));

  const startPath = useDerivedValue(() =>
    interpolate(progress.value, [0, 0.5, 1], [0.6, 0.3, 0.6])
  );

  const circle = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.addCircle(canvasSize / 2, canvasSize / 2, radius);
    return skPath;
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(1000)}
      exiting={FadeOut.duration(1000)}
      style={rContainerStyle}
    >
      <Canvas style={{ width: canvasSize, height: canvasSize }}>
        <Path
          path={circle}
          style="stroke"
          strokeWidth={strokeWidth}
          start={startPath}
          end={1}
          strokeCap="round"
        >
          <SweepGradient
            c={vec(canvasSize / 2, canvasSize / 2)}
            colors={['cyan', 'magenta', 'yellow', 'cyan']}
          />
          <BlurMask blur={5} style="solid" />
        </Path>
      </Canvas>
    </Animated.View>
  );
};
