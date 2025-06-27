import { IconMapPin } from '@tabler/icons-react-native';
import { useEffect } from 'react';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Button } from '~/src/components/ui/button';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { cn } from '~/src/lib/utils';

import { useTheme } from '~/src/lib/theme/theme-provider';
import { MapMarker } from '../../../components/ui/map.native';

const AnimatedMapMarker = Animated.createAnimatedComponent(MapMarker);

const stagger = 100;
const initialExitingDelay = 0;

export function StaggeredMapMarker({
  attraction,
  index,
  onPress,
  count: _count,
  isSelected,
}: {
  attraction: PlacesResponse['places'][number];
  index: number;
  onPress: () => void;
  count: number;
  isSelected: boolean;
}) {
  const rotation = useSharedValue(0);
  const { colors } = useTheme();
  useEffect(() => {
    if (!isSelected) {
      rotation.set(withSpring(0));
      return;
    }

    rotation.set(
      withRepeat(
        withSequence(
          withSpring(3, { damping: 20, stiffness: 100 }),
          withSpring(-3, { damping: 20, stiffness: 100 })
        ),
        -1,
        true
      )
    );
  }, [isSelected, rotation]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: rotation.value }],
  }));

  return (
    <AnimatedMapMarker
      coordinate={{
        latitude: attraction.location.latitude,
        longitude: attraction.location.longitude,
      }}
      title={attraction.displayName.text}
      description={attraction.editorialSummary?.text}
      onPress={onPress}
      style={animatedStyles}
      entering={FadeInDown.duration(250).delay(index * stagger)}
      exiting={FadeOutDown.duration(250).delay(initialExitingDelay + index * stagger)}
    >
      <Button
        size={'icon'}
        className={cn('native:rounded-full bg-background p-2 shadow')}
        onPress={onPress}
      >
        <IconMapPin size={16} color={colors.foreground} />
      </Button>
    </AnimatedMapMarker>
  );
}
