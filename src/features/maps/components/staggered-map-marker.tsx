import { SparklesIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { MapMarker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { COLORS } from '~/src/lib/theme/colors';

const AnimatedMapMarker = Animated.createAnimatedComponent(MapMarker);

// Custom animated marker component with staggered entrance animation
export function StaggeredMapMarker({
  attraction,
  index,
  selectedAttractionId,
  onPress,
}: {
  attraction: PlacesResponse['places'][number];
  index: number;
  selectedAttractionId: string | undefined;
  onPress: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Reset animations
    scale.set(0);
    opacity.set(0);
    translateY.set(20);

    // Staggered entrance animation
    const delay = index * 100; // 100ms delay between each marker

    scale.set(
      withDelay(
        delay,
        withSpring(1, {
          damping: 15,
          stiffness: 200,
          mass: 1,
        })
      )
    );

    opacity.set(withDelay(delay, withTiming(1, { duration: 400 })));

    translateY.set(
      withDelay(
        delay,
        withSpring(0, {
          damping: 15,
          stiffness: 200,
          mass: 1,
        })
      )
    );
  }, [index, scale, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.get() }, { translateY: translateY.get() }],
      opacity: opacity.get(),
    };
  });

  const isSelected = selectedAttractionId === attraction.id;

  return (
    <AnimatedMapMarker
      coordinate={{
        latitude: attraction.location.latitude,
        longitude: attraction.location.longitude,
      }}
      title={attraction.name}
      description={attraction.editorialSummary?.text}
      onPress={onPress}>
      <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
        {isSelected && (
          <Animated.View
            className="bg-secondary/30 absolute inset-0 h-10 w-10 rounded-full"
            style={{
              transform: [{ scale: 1.2 }],
            }}
          />
        )}
        <Animated.View
          className="rounded-full bg-white p-2 shadow-lg"
          style={{
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}>
          <SparklesIcon size={16} color={COLORS.light.primary} />
        </Animated.View>
      </Animated.View>
    </AnimatedMapMarker>
  );
}
