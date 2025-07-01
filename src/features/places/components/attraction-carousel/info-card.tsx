import { IconStar } from '@tabler/icons-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type NativeMapView from 'react-native-maps';
import Animated, { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Text } from '~/src/components/ui/text';
import { api } from '~/src/convex/_generated/api';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { useSheetStore } from '~/src/features/places/store';
import { useTheme } from '~/src/lib/theme/theme-provider';

interface Props {
  place: PlacesResponse['places'][number];
  width: number;
  onOpenAttraction: (attraction: PlacesResponse['places'][number]) => void;
  onLayout?: () => void;
  mapRef: React.RefObject<NativeMapView>;
  selectedAttraction: PlacesResponse['places'][number] | null;
}

export const InfoItem = ({
  mapRef,
  place,
  width: itemWidth,
  onOpenAttraction,
  onLayout,
  selectedAttraction,
}: Props) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const hasAnimated = useRef(false);
  const photoUrl = useAction(api.placesActions.getPlacesPhotoUrl);
  const isSheetOpen = useSheetStore((state) => state.isOpen);
  const { theme } = useTheme();

  const center = useMemo(
    () => ({
      latitude: selectedAttraction?.location.latitude ?? 0,
      longitude: selectedAttraction?.location.longitude ?? 0,
    }),
    [selectedAttraction]
  );

  const imageQuery = useQuery({
    queryKey: ['places', 'photo', place.id],
    queryFn: () => photoUrl({ photoName: place.photos[0].name }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (hasAnimated.current) {
      return;
    }
    hasAnimated.current = true;

    opacity.set(withDelay(100, withTiming(1, { duration: 500 })));
  }, [opacity]);

  const heading = useRef(0);
  const previousCenter = useRef({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
  });
  const interval = useRef<number | null>(null);

  const pitch = 60;
  const speed = 0.05;
  const altitude = 400;

  const animateCamera = useCallback(() => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }

    if (!isSheetOpen) {
      if (interval.current) {
        cancelAnimationFrame(interval.current);
        interval.current = null;
      }
      return;
    }

    if (!selectedAttraction?.location.latitude || !selectedAttraction.location.longitude) {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    const cameraCenter = {
      latitude: selectedAttraction.location.latitude,
      longitude: selectedAttraction.location.longitude,
    };

    try {
      mapRef.current.setCamera({
        center: cameraCenter,
        pitch,
        altitude,
        heading: (heading.current = (heading.current - speed) % 360),
      });

      if (isSheetOpen) {
        interval.current = requestAnimationFrame(animateCamera);
      }
    } catch (error) {
      console.error('❌ Error during camera animation:', error);
      if (interval.current) {
        cancelAnimationFrame(interval.current);
        interval.current = null;
      }
    }
  }, [selectedAttraction, mapRef, isSheetOpen, pitch, altitude, speed]);

  useEffect(() => {
    if (!isSheetOpen) {
      if (interval.current) {
        cancelAnimationFrame(interval.current);
        interval.current = null;
      }
    }
  }, [isSheetOpen]);

  useEffect(() => {
    if (interval.current) {
      cancelAnimationFrame(interval.current);
    }

    if (!center.latitude || !center.longitude) {
      return;
    }

    if (
      previousCenter.current.latitude !== center.latitude ||
      previousCenter.current.longitude !== center.longitude
    ) {
      previousCenter.current = center;

      if (isSheetOpen) {
        animateCamera();
      }
    } else if (isSheetOpen && center.latitude && center.longitude) {
      animateCamera();
    }

    return () => {
      if (interval.current) {
        cancelAnimationFrame(interval.current);
      }
    };
  }, [mapRef, animateCamera, altitude, center, isSheetOpen]);

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
          tint={theme === 'dark' ? 'dark' : 'light'}
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
          </View>
          <View className="w-full flex-1 flex-col gap-1 text-foreground">
            <Text variant={'title3'}>{place.displayName.text}</Text>

            {place.rating ? (
              <View className="flex-row items-center gap-1">
                <Text variant="caption1">{place.rating}</Text>
                <IconStar size={12} fill="#FBBF24" stroke="#FBBF24" />
                <Text variant="caption1">
                  ({Intl.NumberFormat('en-US').format(place.userRatingCount)})
                </Text>
              </View>
            ) : null}
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
