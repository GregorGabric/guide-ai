import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import { useForegroundPermissions } from 'expo-location';
import { CircleIcon } from 'lucide-react-native';
import type { RefObject } from 'react';
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
import { ActivityIndicator } from '~/src/components/ui/loading-indicator';
import { Sheet, useSheetRef } from '~/src/components/ui/sheet';
import { H2, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { colors } from '~/src/utils/theme';

// Analysis Result Sheet Component
function AnalysisResultSheet({
  analysisText,
  sheetRef,
}: {
  analysisText: string;
  sheetRef: RefObject<BottomSheetModal | null>;
}) {
  const insets = useSafeAreaInsets();
  const snapPoints = ['50%', '80%'];

  return (
    <Sheet
      ref={sheetRef}
      snapPoints={snapPoints}
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
      <View className="flex-1 overflow-clip rounded-3xl px-4 pb-4">
        <View className="mb-6">
          <H2 className="mb-4">Analysis Result</H2>
        </View>

        <ScrollView
          className="flex-1 overflow-clip pb-10"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          <View className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 ">
            <P className="font-medium leading-7 text-slate-700">{analysisText}</P>
          </View>
        </ScrollView>
      </View>
    </Sheet>
  );
}

export default function CameraAnalysis() {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const [locationPermissionStatus, requestLocationPermission] = useForegroundPermissions();
  const [analysisResult, setAnalysisResult] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const analysisSheetRef = useSheetRef();
  const tabBarHeight = useBottomTabBarHeight();
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const analyzeImageAction = useAction(api.image.analyzeImage);

  const analyzeImage = useMutation({
    mutationFn: analyzeImageAction,
  });

  // Handle tab focus to activate/deactivate camera
  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => setIsCameraActive(false);
    }, [])
  );

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
        const photo = await camera.current.takePhoto();

        const base64 = await FileSystem.readAsStringAsync(photo.path, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Get location if available, otherwise use default coordinates
        const location = locationPermissionStatus?.granted
          ? {
              latitude: 0, // You might want to get actual location here
              longitude: 0,
            }
          : {
              latitude: 0,
              longitude: 0,
            };

        const analysis = await analyzeImage.mutateAsync({
          imageBase64: base64,
          location,
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

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="mb-4 text-white">Camera permission is required</Text>
        <Button onPress={() => requestPermission()} variant="primary">
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">No camera device found</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1">
        <VisionCamera
          ref={camera}
          style={{
            flex: 1,
          }}
          device={device}
          isActive
          photo
          enableLocation={locationPermissionStatus?.granted}
        />

        <View
          style={{
            bottom: insets.bottom + tabBarHeight,
          }}
          className="absolute inset-x-0 flex-row items-center justify-center px-16"
        >
          <View className="flex-1 items-center justify-center">
            <Button
              onPress={handleCapturePhoto}
              variant="primary"
              disabled={analyzeImage.isPending}
              className="h-16 w-16 rounded-full"
            >
              <CircleIcon size={44} color={colors.background} />
            </Button>
          </View>
        </View>

        {/* Optional location permission banner */}
        {!locationPermissionStatus?.granted && (
          <View className="absolute inset-x-0 top-0 bg-yellow-500/90 p-3">
            <Text className="text-center text-sm text-white">
              Enable location for better analysis results
            </Text>
            <Button
              onPress={() => requestLocationPermission()}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              <Text className="text-xs">Enable Location</Text>
            </Button>
          </View>
        )}

        {/* Loading Overlay */}
        {analyzeImage.isPending && <ActivityIndicator />}
      </View>

      {/* Analysis Result Sheet */}
      <AnalysisResultSheet analysisText={analysisResult} sheetRef={analysisSheetRef} />
    </>
  );
}
