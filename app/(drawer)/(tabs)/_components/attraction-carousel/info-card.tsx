import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { PlacesResponse } from '~/services/places/types';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// On card change, this is a distance the card passes from it comes fully visible to final position
const _translateXGap = 25;

interface Props {
  index: number;
  scrollOffsetX: SharedValue<number>;
  place: PlacesResponse['places'][number];
  width: number;
  onOpenAttraction: (attraction: PlacesResponse['places'][number]) => void;
}

export const InfoItem = ({
  index,
  scrollOffsetX,
  place,
  width: itemWidth,
  onOpenAttraction,
}: Props) => {
  const scale = useSharedValue(1);

  // const rCardStyle = useAnimatedStyle(() => {
  //   const progress = scrollOffsetX.value / itemWidth;

  //   const fadeOut = interpolate(progress, [index, index + 0.7], [1, 0], Extrapolation.CLAMP);
  //   const fadeIn = interpolate(progress, [index - 0.3, index], [0, 1], Extrapolation.CLAMP);

  //   const translateXOut = interpolate(
  //     progress,
  //     [index, index + 0.7],
  //     [0, itemWidth * 0.7 - _translateXGap],
  //     Extrapolation.CLAMP
  //   );
  //   const translateXIn = interpolate(
  //     progress,
  //     [index - 0.3, index],
  //     [-itemWidth * 0.3 + _translateXGap, 0],
  //     Extrapolation.CLAMP
  //   );

  //   return {
  //     opacity: fadeOut * fadeIn,
  //     transform: [
  //       {
  //         translateX: translateXOut + translateXIn,
  //       },
  //       {
  //         scale: scale.value,
  //       },
  //     ],
  //   };
  // });

  const blurAnimatedProps = useAnimatedProps(() => {
    const intensity = interpolate(
      scrollOffsetX.value,
      [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth],
      [50, 0, 50],
      Extrapolation.CLAMP
    );

    return {
      intensity,
    };
  });

  return (
    <Pressable
      className="px-5"
      style={{ width: itemWidth }}
      onPressIn={() => {
        scale.set(withTiming(0.99, { duration: 100 }));
      }}
      onPress={() => {
        onOpenAttraction(place);
      }}
      onPressOut={() => {
        scale.set(withTiming(1));
      }}>
      <AnimatedBlurView
        experimentalBlurMethod="dimezisBlurView"
        tint="systemMaterial"
        style={[
          {
            borderRadius: 10,
            borderCurve: 'continuous',
            width: itemWidth - 32,
            overflow: 'hidden',
            padding: 16,

            justifyContent: 'center',
          },
        ]}
        className="h-20 flex-row items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 px-5 py-3">
        <View
          className="aspect-square h-full items-center justify-center rounded-xl bg-neutral-800"
          style={styles.borderCurve}>
          <Text className="font-semibold text-stone-300">{place.id}</Text>
        </View>
        <View className="flex-1 gap-2">
          <Text>{place.displayName.text}</Text>
        </View>
        <AnimatedBlurView
          experimentalBlurMethod="dimezisBlurView"
          animatedProps={blurAnimatedProps}
          tint="systemMaterial"
          className="absolute inset-0"
          style={[styles.borderCurve, StyleSheet.absoluteFill]}
        />
      </AnimatedBlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
});
