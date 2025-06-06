import { useMutation } from '@tanstack/react-query';
import * as Location from 'expo-location';

export const useLocation = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

        if (currentStatus === Location.PermissionStatus.GRANTED) {
          return {
            status: Location.PermissionStatus.GRANTED,
            error: null,
          } as const;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== Location.PermissionStatus.GRANTED) {
          let errorMessage = 'Permission to access location was denied';

          // Provide more specific error messages based on status
          switch (status) {
            case Location.PermissionStatus.DENIED:
              errorMessage =
                'Location permission was denied. You can enable it in your device settings.';
              break;
            case Location.PermissionStatus.UNDETERMINED:
              errorMessage = 'Location permission was not determined. Please try again.';
              break;
            default:
              errorMessage = 'Please enable location access in device settings.';
          }

          return {
            status: Location.PermissionStatus.DENIED,
            error: errorMessage,
          } as const;
        }
      } catch (error) {
        console.error('Error in initializeLocationAndAttractions:', error);
        const errorMessage = `Error fetching location or attractions: ${error}`;
        return {
          status: Location.PermissionStatus.UNDETERMINED,
          error: errorMessage,
        };
      }
    },
  });
};
