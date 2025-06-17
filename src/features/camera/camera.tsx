import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMutation } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import { useForegroundPermissions } from 'expo-location';
import { XIcon } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Camera } from 'react-native-vision-camera';
import {
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';
import { Sheet } from '~/src/components/ui/sheet';
import { H4, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { cn } from '~/src/lib/utils';
import { colors } from '~/src/utils/theme';

interface CameraViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Analysis Result Sheet Component
function AnalysisResultSheet({
  analysisText,
  sheetRef,
}: {
  analysisText: string;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}) {
  const insets = useSafeAreaInsets();
  const snapPoints = ['50%', '80%'];

  const handleSheetChanges = useCallback((index: number) => {
    // Sheet handles its own closing
  }, []);

  return (
    <Sheet
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      enableOverDrag={false}
      enableDynamicSizing={false}
      detached
      bottomInset={insets.bottom}
      topInset={insets.top}
      style={{
        borderCurve: 'continuous',
        marginInline: insets.left + 8,
      }}
      backgroundStyle={{
        borderRadius: 47 - (insets.left + 12),
        backgroundColor: colors['card-background'],
      }}
    >
      <View className="flex-1 px-4">
        <View className="mb-6">
          <H4 className="mb-4">Analysis Result</H4>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          <View className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
            <P className="font-medium leading-7 text-slate-700">{analysisText}</P>
          </View>
        </ScrollView>
      </View>
    </Sheet>
  );
}

export function CameraView({ isOpen, setIsOpen }: PropsWithChildren<CameraViewProps>) {
  const device = useCameraDevice('back');
  const [locationPermissionStatus, requestLocationPermission] = useForegroundPermissions();

  // State for analysis sheet
  const [analysisResult, setAnalysisResult] = useState('');
  const analysisSheetRef = useRef<BottomSheetModal>(null);

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

        // Show the analysis result sheet
        setAnalysisResult(analysis || 'No analysis available');
        analysisSheetRef.current?.present();
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
    <>
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

      {/* Analysis Result Sheet */}
      <AnalysisResultSheet analysisText={analysisResult} sheetRef={analysisSheetRef} />
    </>
  );
}
