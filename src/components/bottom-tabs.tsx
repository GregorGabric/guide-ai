import { IconCamera, IconNavigation, IconRoute } from '@tabler/icons-react-native';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/src/components/ui/button';
import { useTheme } from '~/src/lib/theme/theme-provider';

interface BottomTabsProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  centerMap: () => void;
}

export function BottomTabs({ centerMap }: BottomTabsProps) {
  const { bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const paddingBottom = bottom;

  return (
    <BlurView
      className="absolute bottom-0 left-1/2 -translate-x-1/2 flex-row items-center gap-6 overflow-hidden rounded-full border border-background px-4 py-2"
      style={{ marginBottom: paddingBottom, borderCurve: 'continuous' }}
      experimentalBlurMethod="dimezisBlurView"
      tint={theme === 'dark' ? 'dark' : 'light'}
      intensity={100}
    >
      <Link href="/visited" asChild>
        <Button variant="tonal" className="native:rounded-full size-11" size="icon">
          <IconRoute color="#fff" />
        </Button>
      </Link>
      <Button
        variant="primary"
        className="native:rounded-full size-14 border border-background"
        size="icon"
        onPress={centerMap}
      >
        <IconNavigation color="#fff" size={24} />
      </Button>
      <Link href="/camera" asChild>
        <Button className="native:rounded-full size-11" size={'icon'} variant={'tonal'}>
          <IconCamera color="#fff" />
        </Button>
      </Link>
    </BlurView>
  );
}
