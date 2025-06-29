import { IconStar } from '@tabler/icons-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import type NativeMapView from 'react-native-maps';
import Animated, { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { api } from '~/src/convex/_generated/api';
import { useSheetStore } from '~/src/features/places/components/attraction-bottom-sheet';
import type { PlacesResponse } from '~/src/features/places/services/types';

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

  const center = useMemo(
    () => ({
      latitude: selectedAttraction?.location.latitude,
      longitude: selectedAttraction?.location.longitude,
    }),
    [selectedAttraction]
  );

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

  const heading = useRef(0);
  const previousCenter = useRef({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
  });
  const interval = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const animatingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pitch = 60;
  const speed = 0.03;
  const altitude = 1000;

  const animateCamera = useCallback(() => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }
    if (!mapRef.current) {
      return;
    }

    if (!isSheetOpen) {
      return;
    }

    const cameraCenter =
      center.latitude && center.longitude
        ? {
            latitude: center.latitude + 0.003,
            longitude: center.longitude,
          }
        : center;

    mapRef.current.setCamera({
      center: cameraCenter,
      pitch,
      altitude,
      heading: (heading.current = (heading.current - speed) % 360),
    });

    interval.current = requestAnimationFrame(animateCamera);
  }, [center, mapRef, isSheetOpen]);

  useEffect(() => {
    const off = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isSheetOpen) {
        animateCamera();
      } else {
        if (interval.current) {
          clearInterval(interval.current);
        }
      }
    });

    return () => {
      off.remove();
    };
  }, [animateCamera, isSheetOpen]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
    if (animatingRef.current) {
      clearTimeout(animatingRef.current);
    }

    if (mapRef.current && previousCenter.current !== center) {
      previousCenter.current = center;

      mapRef.current.animateCamera(
        {
          center: {
            latitude: center.latitude ?? 0,
            longitude: center.longitude ?? 0,
          },
          pitch,
          altitude,
          heading: heading.current,
        },
        {
          duration: 1000,
        }
      );

      if (isSheetOpen) {
        animatingRef.current = setTimeout(() => {
          animateCamera();
        }, 1000);
      }
    } else if (isSheetOpen && center.latitude && center.longitude) {
      animateCamera();
    }

    return () => {
      clearInterval(interval.current);
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
