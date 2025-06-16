import { CameraIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';
export function Camera() {
  const device = useCameraDevice('back');

  const { requestPermission, hasPermission } = useCameraPermission();

  const [open, setOpen] = useState(false);

  return (
    <View className="flex-1 items-center justify-center">
      {device && open && (
        <VisionCamera
          style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: 9000,
          }}
          device={device}
          isActive={open}
        />
      )}
      <Button
        size={'icon'}
        variant={'primary'}
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
        <CameraIcon size={24} />
      </Button>
    </View>
  );
}
