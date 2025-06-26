import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY;
export function useInitCat() {
  useEffect(() => {
    if (!API_KEY) {
      console.error('REVENUE_CAT_API_KEY is not set');
      return;
    }

    if (__DEV__) {
      void Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEY });
    }
    //  else if (Platform.OS === 'android') {
    //   Purchases.configure({ apiKey: API_KEY });
    // }
  }, []);
}
