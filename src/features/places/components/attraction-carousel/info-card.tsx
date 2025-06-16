import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { StarIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { api } from '~/src/convex/_generated/api';
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
  const photoUrl = useAction(api.placesActions.getPlacesPhotoUrl);

  const imageQuery = useQuery({
    queryKey: ['places', 'photo', place.id],
    queryFn: () => photoUrl({ photoName: place.photos[0].name }),
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
        className="h-32 flex-row items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 px-5 py-3"
      >
        <View
          className="aspect-square h-full items-center justify-center rounded-xl "
          style={styles.borderCurve}
        >
          {imageQuery.data && (
            <Image
              source={{ uri: imageQuery.data }}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              contentFit="cover"
            />
          )}
          {/* <Text className="font-semibold text-stone-300">{place.id}</Text> */}
        </View>
        <View className="w-full flex-1 flex-col gap-1">
          <Text className="text-lg font-semibold">{place.displayName.text}</Text>
          <View className="flex-row items-center gap-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold">{place.rating}</Text>
              <StarIcon size={12} fill="#FBBF24" stroke="#FBBF24" />
              <Text className="text-xs font-semibold">
                ({Intl.NumberFormat('en-US').format(place.userRatingCount)})
              </Text>
            </View>
          </View>
          {/* <View className="flex-row items-center gap-2">
            <Text className="text-sm text-neutral-500">{place.displayName.text}</Text>
          </View> */}
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
