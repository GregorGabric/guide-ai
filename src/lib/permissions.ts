import * as Location from 'expo-location';

// Permission Types
export type PermissionType = 'location' | 'camera' | 'microphone';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionConfig {
  type: PermissionType;
  title: string;
  description: string;
  isRequired: boolean;
  icon: string;
  // Platform-specific settings
  ios?: {
    usageDescription?: string;
  };
  android?: {
    permissions?: Array<string>;
  };
}

// Centralized Permission Configuration
export const PERMISSION_CONFIG: Record<PermissionType, PermissionConfig> = {
  location: {
    type: 'location',
    title: 'Location Access',
    description: 'To discover nearby places and provide location-based recommendations',
    isRequired: true,
    icon: '📍',
    ios: {
      usageDescription: 'Allow $(PRODUCT_NAME) to use your location.',
    },
    android: {
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
    },
  },
  camera: {
    type: 'camera',
    title: 'Camera Access',
    description: 'To take photos and analyze places around you',
    isRequired: true,
    icon: '📷',
    ios: {
      usageDescription: '$(PRODUCT_NAME) needs access to your Camera.',
    },
  },
  microphone: {
    type: 'microphone',
    title: 'Microphone Access',
    description: 'To record audio and provide voice features',
    isRequired: false,
    icon: '🎤',
    ios: {
      usageDescription: 'Allow $(PRODUCT_NAME) to access your microphone.',
    },
  },
};

// Permission Status Mapping
export const mapExpoLocationStatus = (status: Location.PermissionStatus): PermissionStatus => {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return 'granted';
    case Location.PermissionStatus.DENIED:
      return 'denied';
    case Location.PermissionStatus.UNDETERMINED:
    default:
      return 'undetermined';
  }
};

// Current Permission Usage Audit
export const CURRENT_PERMISSION_USAGE = {
  location: {
    files: [
      'src/app/_layout.tsx',
      'src/features/camera/camera.tsx',
      'src/features/maps/hooks/useLocation.ts',
    ],
    hooks: ['useForegroundPermissions'],
    library: 'expo-location',
    implementation: 'scattered',
    notes: 'Requested in _layout.tsx on app startup, also checked in camera and useLocation hook',
  },
  camera: {
    files: ['src/components/bottom-tabs.tsx', 'src/features/camera/camera.tsx'],
    hooks: ['useCameraPermission'],
    library: 'react-native-vision-camera',
    implementation: 'basic',
    notes: 'Requested when camera button is pressed or camera component mounts',
  },
  microphone: {
    files: ['app.json'],
    hooks: [],
    library: 'expo-audio',
    implementation: 'configured',
    notes: 'Only configured in app.json, not explicitly checked in code yet',
  },
} as const;

// Required vs Optional Permissions
export const REQUIRED_PERMISSIONS: Array<PermissionType> = ['location', 'camera'];
export const OPTIONAL_PERMISSIONS: Array<PermissionType> = ['microphone'];

// Permission Request Order (for onboarding flow)
export const PERMISSION_REQUEST_ORDER: Array<PermissionType> = ['location', 'camera', 'microphone'];
