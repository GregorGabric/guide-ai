import { useMutation } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import { useForegroundPermissions } from 'expo-location';
import { XIcon } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import type { Camera } from 'react-native-vision-camera';
import {
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';
import { api } from '~/src/convex/_generated/api';
import { cn } from '~/src/lib/utils';
interface CameraViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CameraView({ isOpen, setIsOpen }: PropsWithChildren<CameraViewProps>) {
  const device = useCameraDevice('back');
  const [locationPermissionStatus, requestLocationPermission] = useForegroundPermissions();

  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const analyzeImageAction = useAction(api.image.analyzeImage);

  const analyzeImage = useMutation({
    mutationFn: analyzeImageAction,
  });

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission().then((granted) => {
        if (!granted) {
          Alert.alert('Camera Permission', 'Camera permission is required to use this feature.');
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const handleCapturePhoto = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takeSnapshot({
          quality: 90,
        });

        const base64 = await FileSystem.readAsStringAsync(photo.path, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const analysis = await analyzeImage.mutateAsync({
          imageBase64: base64,
          location: {
            latitude: 0,
            longitude: 0,
          },
        });

        console.log('Analysis result:', analysis);

        // Method 2: Alternative - Upload to Convex storage (commented out)
        // const response = await fetch(photo.path);
        // const blob = await response.blob();
        // const storageId = await generateUploadUrl.mutateAsync();
        // await fetch(storageId.uploadUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': blob.type },
        //   body: blob,
        // });
        // Then pass storageId to your action instead of base64
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleCloseCamera = () => {
    setIsOpen(false);
  };

  // TODO: this sucks
  if (!locationPermissionStatus?.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Location permission is required</Text>
        <Button onPress={() => requestLocationPermission()} variant="primary">
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Camera permission is required</Text>
        <Button onPress={() => requestPermission()} variant="primary">
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No camera device found</Text>
      </View>
    );
  }

  return (
    <View
      className={cn('absolute inset-0 z-20', {
        'opacity-100': isOpen,
        'opacity-0': !isOpen,
        hidden: !isOpen,
      })}
    >
      <VisionCamera
        video
        ref={camera}
        style={{
          flex: 1,
        }}
        device={device}
        isActive={isOpen}
        photo
        enableLocation={locationPermissionStatus.granted}
      />

      <View className="absolute inset-0 flex-row items-center justify-between bg-transparent p-4">
        <View className="flex-row items-center justify-start">
          <Button onPress={handleCloseCamera} variant="secondary" size="icon">
            <XIcon color="#fff" />
          </Button>
        </View>

        <View className="flex-row items-center justify-center">
          <Button
            onPress={handleCapturePhoto}
            variant="primary"
            size="lg"
            className="rounded-full bg-white p-4"
          >
            <Text className="text-2xl">📷</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
