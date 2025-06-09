import { startTransition, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PlacesResponse } from '~/services/places/types';
import { InfoItem } from './info-card';
import { PaginationDots } from './pagination-dots';

// NOTE: This component is disabled on Android for two reasons:
// 1. Nested horizontal list inside parent horizontal list performs poorly on Android
// 2.Tricky entering and exiting interpolation of carousel card works poorly on Android
interface AttractionCarouselProps {
  data: PlacesResponse['places'];
  onPressOut: (attraction: PlacesResponse['places'][number]) => void;
  onAttractionPress?: (attraction: PlacesResponse['places'][number]) => void;
  setSelectedAttraction: (attraction: PlacesResponse['places'][number]) => void;
}

export const AttractionCarousel = ({
  data,
  onPressOut,
  onAttractionPress,
  setSelectedAttraction,
}: AttractionCarouselProps) => {
  const scrollOffsetX = useSharedValue(0);
  const [width, setWidth] = useState(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffsetX.set(event.contentOffset.x);
  });

  const { bottom: tabBarPaddingBottom } = useSafeAreaInsets();

  const paddingBottom = tabBarPaddingBottom + 12;

  return (
    <View
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
      className="absolute bottom-0 mt-4 w-full gap-3"
      style={{ paddingBottom: paddingBottom }}>
      <PaginationDots numberOfItems={data.length} scrollOffsetX={scrollOffsetX} />

      <Animated.ScrollView
        className="flex-1"
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          const nextLocation = data[index];
          setSelectedAttraction(nextLocation);
          runOnJS(onPressOut)(nextLocation);
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        {data.map((place) => (
          <InfoItem
            width={width}
            place={place}
            onOpenAttraction={(attraction) => {
              startTransition(() => {
                setSelectedAttraction(attraction);
                onAttractionPress?.(attraction);
              });
            }}
            key={place.id}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};
