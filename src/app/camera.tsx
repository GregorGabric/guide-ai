import { useFocusEffect } from '@react-navigation/native';
import { IconCircle } from '@tabler/icons-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import { useForegroundPermissions } from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Camera } from 'react-native-vision-camera';
import {
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';
import { ActivityIndicator } from '~/src/components/ui/loading-indicator';
import { ScrollView } from '~/src/components/ui/scroll-view';
import { Text } from '~/src/components/ui/text';
import { H2, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { colors } from '~/src/utils/theme';

// Analysis Result Modal Component using React Native Modal
function AnalysisResultModal({
  analysisText,
  visible,
  onClose,
}: {
  analysisText: string;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header with close button */}
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="flex-row items-center justify-between border-b border-border bg-card px-4 pb-4"
        >
          <H2>Analysis Result</H2>
          <TouchableOpacity onPress={onClose} className="rounded-full bg-secondary p-2">
            <Text className="px-2">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
            <P className="font-medium leading-7 text-slate-700">{analysisText}</P>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function CameraAnalysis() {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const [locationPermissionStatus, requestLocationPermission] = useForegroundPermissions();
  const [analysisResult, setAnalysisResult] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  // const tabBarHeight = useBottomTabBarHeight();
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const analyzeImageAction = useAction(api.image.analyzeImage);

  const analyzeImage = useMutation({
    mutationFn: analyzeImageAction,
  });

  // Handle tab focus to activate/deactivate camera
  useFocusEffect(
    useCallback(() => {
      return () => {
        setCapturedPhoto(null); // Clear photo when leaving camera
      };
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

        // Show captured photo immediately
        setCapturedPhoto(photo.path);

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

        // Show the analysis result sheet
        setAnalysisResult(analysis || 'No analysis available');
        setShowAnalysisModal(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      setCapturedPhoto(null); // Clear photo on error
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setAnalysisResult('');
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
    <View className="flex-1">
      {/* Camera View */}
      {!capturedPhoto && (
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
      )}

      {/* Photo Preview */}
      {capturedPhoto && (
        <View className="flex-1">
          <Image
            source={{ uri: `file://${capturedPhoto}` }}
            className="flex-1"
            resizeMode="cover"
          />

          {/* Retake button overlay */}
          <View
            style={{
              bottom: insets.bottom + 40,
            }}
            className="absolute inset-x-0 flex-row items-center justify-center px-16"
          >
            <Button onPress={handleRetakePhoto} variant="primary">
              <Text>Retake</Text>
            </Button>
          </View>
        </View>
      )}

      {/* Camera controls */}
      {!capturedPhoto && (
        <View
          style={{
            bottom: insets.bottom,
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
              <IconCircle size={44} color={colors.background} />
            </Button>
          </View>
        </View>
      )}

      {/* Optional location permission banner */}
      {!locationPermissionStatus?.granted && !capturedPhoto && (
        <View className="absolute inset-x-0 top-0 bg-yellow-500/90 p-3" style={{ zIndex: 10 }}>
          <Text className="text-center text-sm text-white">
            Enable location for better analysis results
          </Text>
          <Button
            onPress={() => requestLocationPermission()}
            variant="secondary"
            size="sm"
            className="mt-2"
          >
            <Text>Enable Location</Text>
          </Button>
        </View>
      )}

      {/* Loading Overlay - Fixed positioning and z-index */}
      {analyzeImage.isPending && (
        <View
          className="bg-background/50 absolute inset-0 items-center justify-center"
          style={{ zIndex: 100 }}
        >
          <View className="items-center">
            <ActivityIndicator />
            <Text className="mt-4 font-medium ">Analyzing photo...</Text>
          </View>
        </View>
      )}

      {/* Analysis Result Sheet - Rendered directly as sibling */}
      <AnalysisResultModal
        analysisText={analysisResult}
        visible={showAnalysisModal}
        onClose={() => {
          setShowAnalysisModal(false);
        }}
      />
    </View>
  );
}
