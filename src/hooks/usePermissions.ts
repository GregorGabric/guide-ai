import { AudioModule } from 'expo-audio';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import {
  type PermissionStatus,
  type PermissionType,
  PERMISSION_REQUEST_ORDER,
  mapExpoLocationStatus,
} from '~/src/lib/permissions';

export interface UsePermissionsReturn {
  permissionStatuses: Record<PermissionType, PermissionStatus>;
  requestPermission: (type: PermissionType) => Promise<void>;
  requestAllPermissions: () => Promise<void>;
  checkAllPermissions: () => Promise<void>;
  isLoading: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissionStatuses, setPermissionStatuses] = useState<
    Record<PermissionType, PermissionStatus>
  >({
    location: 'undetermined',
    camera: 'undetermined',
    microphone: 'undetermined',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission: hasCameraPermission, requestPermission: _requestCameraPermission } =
    useCameraPermission();

  const checkLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return mapExpoLocationStatus(status);
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'undetermined';
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return mapExpoLocationStatus(status);
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return 'denied';
    }
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const granted = await _requestCameraPermission();
      return granted ? 'granted' : 'denied';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return 'denied';
    }
  }, [_requestCameraPermission]);

  const checkCameraPermission = useCallback((): PermissionStatus => {
    return hasCameraPermission ? 'granted' : 'undetermined';
  }, [hasCameraPermission]);

  const requestMicrophonePermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();

      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
      });

      return granted ? 'granted' : 'denied';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(
    async (type: PermissionType): Promise<void> => {
      setIsLoading(true);

      try {
        let newStatus: PermissionStatus;

        switch (type) {
          case 'location':
            newStatus = await requestLocationPermission();
            break;
          case 'camera':
            newStatus = await requestCameraPermission();
            break;
          case 'microphone':
            newStatus = await requestMicrophonePermission();
            break;
          default:
            newStatus = 'undetermined';
        }

        setPermissionStatuses((prev) => ({
          ...prev,
          [type]: newStatus,
        }));

        if (newStatus === 'denied') {
          Alert.alert(
            'Permission Denied',
            'This permission is required for the app to function properly. You can enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  void Linking.openSettings();
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error(`Error requesting ${type} permission:`, error);
        setPermissionStatuses((prev) => ({
          ...prev,
          [type]: 'denied',
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [requestLocationPermission, requestCameraPermission, requestMicrophonePermission]
  );

  const checkAllPermissions = useCallback(async (): Promise<void> => {
    try {
      const locationStatus = await checkLocationPermission();
      const cameraStatus = checkCameraPermission();

      setPermissionStatuses({
        location: locationStatus,
        camera: cameraStatus,
        microphone: 'undetermined',
      });
    } catch (error) {
      console.error('Error checking all permissions:', error);
    }
  }, [checkLocationPermission, checkCameraPermission]);

  const requestAllPermissions = useCallback(async (): Promise<void> => {
    const permissionsToRequest = PERMISSION_REQUEST_ORDER.filter(
      (type) => permissionStatuses[type] !== 'granted'
    );

    // Request permissions sequentially to avoid race conditions
    for (const type of permissionsToRequest) {
      await requestPermission(type);
    }
  }, [permissionStatuses, requestPermission]);

  return {
    permissionStatuses,
    requestPermission,
    requestAllPermissions,
    checkAllPermissions,
    isLoading,
  };
}
