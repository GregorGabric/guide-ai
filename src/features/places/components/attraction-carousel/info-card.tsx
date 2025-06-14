import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import type { PlacesResponse } from '~/src/features/places/services/types';

// On card change, this is a distance the card passes from it comes fully visible to final position
const _translateXGap = 25;

interface Props {
  place: PlacesResponse['places'][number];
  width: number;
  onOpenAttraction: (attraction: PlacesResponse['places'][number]) => void;
}

export const InfoItem = ({ place, width: itemWidth, onOpenAttraction }: Props) => {
  const scale = useSharedValue(1);

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
      }}
    >
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        tint="extraLight"
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
        className="h-20 flex-row items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 px-5 py-3"
      >
        <View
          className="aspect-square h-full items-center justify-center rounded-xl bg-neutral-800"
          style={styles.borderCurve}
        >
          <Text className="font-semibold text-stone-300">{place.id}</Text>
        </View>
        <View className="flex-1 gap-2">
          <Text>{place.displayName.text}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
});
