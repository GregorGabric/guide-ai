import { BlurView } from 'expo-blur';
import { CameraIcon, LocateIcon, MapIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';

interface BottomTabsProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function BottomTabs({ setOpen }: BottomTabsProps) {
  const { hasPermission, requestPermission } = useCameraPermission();

  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      tint="prominent"
      className="mx-auto w-min flex-row items-center justify-center gap-4 overflow-hidden rounded-full border border-background bg-background px-4 py-2"
    >
      <View>
        <MapIcon />
      </View>
      <Button variant="primary" className="native:rounded-full" size="icon">
        <LocateIcon color="#fff" />
      </Button>
      <Button
        className="native:rounded-full"
        size={'icon'}
        variant={'plain'}
        onPress={async () => {
          if (!hasPermission) {
            const result = await requestPermission();
            if (result) {
              setOpen(true);
            } else {
              console.log('Permission denied');
            }
            return;
          }
          setOpen(true);
        }}
      >
        <CameraIcon />
      </Button>
    </BlurView>
  );
}
