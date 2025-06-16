import { SparklesIcon } from 'lucide-react-native';
import { Marker } from 'react-native-maps';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { COLORS } from '~/src/lib/theme/colors';
import { cn } from '~/src/lib/utils';

const AnimatedMapMarker = Animated.createAnimatedComponent(Marker);

// Custom animated marker component with staggered entrance animation
export function StaggeredMapMarker({
  attraction,
  index,
  selectedAttractionId,
  onPress,
  count,
}: {
  attraction: PlacesResponse['places'][number];
  index: number;
  selectedAttractionId: string | undefined;
  onPress: () => void;
  count: number;
}) {
  const isSelected = selectedAttractionId === attraction.id;

  const enterDirection = 1;
  const exitDirection = 1;
  const stagger = 100;
  const initialExitingDelay = 0;

  return (
    <AnimatedMapMarker
      coordinate={{
        latitude: attraction.location.latitude,
        longitude: attraction.location.longitude,
      }}
      title={attraction.displayName.text}
      description={attraction.editorialSummary?.text}
      onPress={onPress}
      entering={FadeInDown.duration(250).delay(
        0 + (enterDirection === 1 ? index * stagger : (count - index) * stagger)
      )}
      exiting={FadeOutDown.duration(250).delay(
        initialExitingDelay + (exitDirection === 1 ? index * stagger : (count - index) * stagger)
      )}
    >
      <Animated.View style={{ alignItems: 'center' }}>
        <Animated.View
          className={cn(
            'rounded-full bg-white p-2 shadow-lg transition-transform',
            isSelected && 'scale-125'
          )}
        >
          <SparklesIcon size={16} color={COLORS.light.primary} />
        </Animated.View>
      </Animated.View>
    </AnimatedMapMarker>
  );
}
