import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { CameraIcon, EarthIcon, NavigationIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/src/components/ui/button';

interface BottomTabsProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  centerMap: () => void;
}

export function BottomTabs({ centerMap }: BottomTabsProps) {
  const { bottom } = useSafeAreaInsets();

  const paddingBottom = bottom;

  return (
    <BlurView
      className="absolute bottom-0 left-1/2 -translate-x-1/2 flex-row items-center gap-6 overflow-hidden rounded-full border px-4 py-2"
      style={{ marginBottom: paddingBottom, borderCurve: 'continuous' }}
      experimentalBlurMethod="dimezisBlurView"
      tint="dark"
      intensity={100}
    >
      <Link href="/visited" asChild>
        <Button variant="tonal" className="native:rounded-full size-11" size="icon">
          <EarthIcon color="#fff" />
        </Button>
      </Link>
      <Button
        variant="primary"
        className="native:rounded-full size-14 border border-white"
        size="icon"
        onPress={centerMap}
      >
        <NavigationIcon color="#fff" />
      </Button>
      <Link href="/camera" asChild>
        <Button className="native:rounded-full size-11" size={'icon'} variant={'tonal'}>
          <CameraIcon color="#fff" />
        </Button>
      </Link>
    </BlurView>
  );
}
