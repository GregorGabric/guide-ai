import { LandmarkIcon } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Button } from '~/src/components/ui/button';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { colors } from '~/src/utils/theme';
import { Marker } from '../../../components/ui/map.native';

const AnimatedMapMarker = Animated.createAnimatedComponent(Marker);

export function StaggeredMapMarker({
  attraction,
  index,
  onPress,
  count,
}: {
  attraction: PlacesResponse['places'][number];
  index: number;
  onPress: () => void;
  count: number;
}) {
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
      <Button size={'icon'} className={'rounded-full bg-secondary  p-2 shadow-lg'}>
        <LandmarkIcon size={16} color={colors['text-on-primary']} />
      </Button>
    </AnimatedMapMarker>
  );
}
