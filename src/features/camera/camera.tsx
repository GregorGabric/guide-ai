import { PropsWithChildren, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { Button } from '~/src/components/ui/button';
import { useLocation } from '~/src/features/maps/hooks/useLocation';

interface CameraViewProps {
  onPhotoTaken: (photo: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CameraView({
  children,
  onPhotoTaken,
  isOpen,
  setIsOpen,
}: PropsWithChildren<CameraViewProps>) {
  const device = useCameraDevice('back');
  const { status } = useLocation();
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then((granted) => {
        if (!granted) {
          Alert.alert('Camera Permission', 'Camera permission is required to use this feature.');
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const handleCapturePhoto = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: 'off',
          enableShutterSound: false,
        });
        onPhotoTaken(photo.path);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleCloseCamera = () => {
    setIsOpen(false);
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <Button onPress={() => requestPermission()} variant="primary">
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <>
      {isOpen && (
        <View style={styles.cameraContainer}>
          <VisionCamera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={isOpen}
            photo={true}
            enableLocation={status === 'success'}
          />

          <View style={styles.controlsContainer}>
            <View style={styles.topControls}>
              <Button onPress={handleCloseCamera} variant="secondary" size="sm">
                <Text style={styles.buttonText}>✕</Text>
              </Button>
            </View>

            <View style={styles.bottomControls}>
              <Button
                onPress={handleCapturePhoto}
                variant="primary"
                size="lg"
                style={styles.captureButton}
              >
                <Text style={styles.captureButtonText}>📷</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'transparent',
  },
  topControls: {
    alignItems: 'flex-start',
    paddingTop: 50,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
  },
  captureButtonText: {
    fontSize: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
