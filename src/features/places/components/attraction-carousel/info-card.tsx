import { IconStar } from '@tabler/icons-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { api } from '~/src/convex/_generated/api';
import type { PlacesResponse } from '~/src/features/places/services/types';

interface Props {
  place: PlacesResponse['places'][number];
  width: number;
  onOpenAttraction: (attraction: PlacesResponse['places'][number]) => void;
  onLayout?: () => void;
}

export const InfoItem = ({ place, width: itemWidth, onOpenAttraction, onLayout }: Props) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const hasAnimated = useRef(false);
  const photoUrl = useAction(api.placesActions.getPlacesPhotoUrl);

  const imageQuery = useQuery({
    queryKey: ['places', 'photo', place.id],
    queryFn: () => photoUrl({ photoName: place.photos[0].name }),
  });

  useEffect(() => {
    if (hasAnimated.current) {
      return;
    }
    hasAnimated.current = true;

    opacity.set(withDelay(100, withTiming(1, { duration: 500 })));
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} onLayout={onLayout}>
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
          className="h-28 flex-row items-center gap-5 overflow-hidden rounded-2xl border border-background px-2 py-2"
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
                <IconStar size={12} fill="#FBBF24" stroke="#FBBF24" />
                <Text className="text-xs font-semibold">
                  ({Intl.NumberFormat('en-US').format(place.userRatingCount)})
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
});
