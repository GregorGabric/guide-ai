import { queryOptions } from '@tanstack/react-query';
import * as Location from 'expo-location';

export const currentLocation = queryOptions({
  queryKey: ['current-location'],
  queryFn: () => {
    // if (process.env.NODE_ENV === 'development') {
    //   return {
    //     coords: {
    //       heading: 0,
    //       speed: 0,
    //       latitude: 52.520008,
    //       longitude: 13.404954,
    //       altitude: 10,
    //       accuracy: 10,
    //       altitudeAccuracy: 0,
    //     },
    //     timestamp: 1717564800000,
    //   };
    // }

    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
    });
  },
});
