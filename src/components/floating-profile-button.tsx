import { IconUser } from '@tabler/icons-react-native';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/src/components/ui/button';

export function FloatingProfileButton() {
  const { top } = useSafeAreaInsets();

  return (
    <BlurView
      className="absolute right-4 overflow-hidden rounded-full border"
      style={{
        top: top + 50, // Position below status bar and some padding
        borderCurve: 'continuous',
      }}
      experimentalBlurMethod="dimezisBlurView"
      tint="dark"
      intensity={100}
    >
      <Link href="/settings" asChild>
        <Button variant="tonal" className="native:rounded-full size-12" size="icon">
          <IconUser color="#fff" size={20} strokeWidth={2.5} />
        </Button>
      </Link>
    </BlurView>
  );
}
