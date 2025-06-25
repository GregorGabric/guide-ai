import { LandmarkIcon } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Button } from '~/src/components/ui/button';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { cn } from '~/src/lib/utils';
import { colors } from '~/src/utils/theme';
import { Marker } from '../../../components/ui/map.native';

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
      <Button
        size={'icon'}
        variant="tonal"
        className={cn('rounded-full  p-2 shadow-lg', isSelected && 'scale-125')}
      >
        <LandmarkIcon size={16} color={colors['text-on-primary']} />
      </Button>
    </AnimatedMapMarker>
  );
}
