import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { skipToken, useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Navigation, Settings, SparklesIcon, Zap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapMarker } from 'react-native-maps';
import { mockData } from '~/app/(drawer)/(tabs)/mock-data';
import AttractionBottomSheet from '~/components/attraction-bottom-sheet';
import { AttractionCarousel } from '~/components/attraction-carousel/attraction-carousel';
import Header from '~/components/header';
import LoadingOverlay from '~/components/loading-overlay';
import { useSheetRef } from '~/components/ui/sheet';
import { COLORS } from '~/lib/theme/colors';
import type { PlacesResponse } from '~/services/places/types';

export default function MapScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<
    PlacesResponse['places'][number] | null
  >(null);

  const [retryCount, setRetryCount] = useState(0);
  const mapRef = useRef<MapView>(null);
  const sheetRef = useSheetRef();

  const initializeLocationAndAttractions = async () => {
    try {
      // Reset permission denied state on retry
      setPermissionDenied(false);

      // First check current permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      console.log('Current permission status:', currentStatus);

      // If not granted, request permissions
      if (currentStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Permission request result:', status);

        if (status !== 'granted') {
          let errorMessage = 'Permission to access location was denied';
          setPermissionDenied(true);

          // Provide more specific error messages based on status
          switch (status) {
            case 'denied':
              errorMessage =
                'Location permission was denied. You can enable it in your device settings.';
              break;
            case 'undetermined':
              errorMessage = 'Location permission was not determined. Please try again.';
              break;
            default:
              errorMessage = `Location permission status: ${status}. Please enable location access in device settings.`;
          }

          setErrorMsg(errorMessage);
          return;
        }
      }

      console.log('Getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });
      console.log('Current location obtained:', currentLocation.coords);
      setLocation(currentLocation);

      // Fetch nearby attractions
      console.log('Fetching nearby attractions...');
    } catch (error) {
      console.error('Error in initializeLocationAndAttractions:', error);
      const errorMessage = `Error fetching location or attractions: ${error}`;
      setErrorMsg(errorMessage);
    }
  };

  useEffect(() => {
    void initializeLocationAndAttractions();
  }, [retryCount]);

  const handleAttractionPress = (attraction: PlacesResponse['places'][number]) => {
    setSelectedAttraction(attraction);
    sheetRef.current?.present();

    // Animate to the selected attraction
    if (mapRef.current) {
      mapRef.current?.animateToRegion(
        {
          latitude: attraction.location.latitude,
          longitude: attraction.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleAttractionPressOnMap = (attraction: PlacesResponse['places'][number]) => {
    setSelectedAttraction(attraction);
    sheetRef.current?.present();

    // Animate to the selected attraction
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: attraction.location.latitude,
          longitude: attraction.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const closeBottomSheet = () => {
    setSelectedAttraction(null);
    sheetRef.current?.dismiss();
  };
  const { data, isPending } = useQuery({
    queryKey: ['attractions', location?.coords.latitude, location?.coords.longitude],
    queryFn: location
      ? () => {
          // const params = new URLSearchParams({
          //   latitude: location.coords.latitude.toString(),
          //   longitude: location.coords.longitude.toString(),
          //   radius: '1000',
          //   maxResults: '10',
          // });
          // const response = await fetch(`/hello?${params.toString()}`, {
          //   method: 'GET',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          // });
          // const data = await response.json();

          return mockData.places as PlacesResponse['places'];
          // return data.places as PlacesResponse['places'];
        }
      : skipToken,
    enabled: !!location,
  });

  if (isPending) {
    return <LoadingOverlay message="🗺️ Discovering amazing places nearby..." />;
  }

  if (errorMsg) {
    return (
      <View className="flex-1 bg-background">
        <Header title="Discover" showBackButton={false} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-10 items-center">
            <View
              className="bg-error/8 mb-6 h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 4,
              }}>
              <Zap size={28} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text
              className="font-quicksand-bold text-text mb-3 text-center text-xl"
              style={{ letterSpacing: -0.3 }}>
              {permissionDenied ? 'Location Permission Required' : 'Something went wrong'}
            </Text>
            <Text
              className="text-text-tertiary font-quicksand max-w-sm text-center text-sm"
              style={{ letterSpacing: 0.1 }}>
              {errorMsg}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="border-primary/20 flex-1 rounded-2xl border bg-primary px-6 py-4"
              style={{
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 6,
              }}
              onPress={() => {
                setErrorMsg(null);
                setPermissionDenied(false);
                setRetryCount((prev) => prev + 1);
              }}
              activeOpacity={0.9}>
              <Text
                className="font-quicksand-medium text-center text-white"
                style={{ letterSpacing: 0.2 }}>
                Try Again
              </Text>
            </TouchableOpacity>

            {permissionDenied && (
              <TouchableOpacity
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
                onPress={() => {
                  void Linking.openSettings();
                }}
                activeOpacity={0.9}>
                <Text
                  className="text-text font-quicksand-medium text-center"
                  style={{ letterSpacing: 0.2 }}>
                  <Settings size={16} color="#6366F1" /> Settings
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 bg-background">
        <Header title="Discover" showBackButton={false} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View
              className="bg-warning/8 mb-6 h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 4,
              }}>
              <Navigation size={28} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text
              className="font-quicksand-bold text-text mb-3 text-center text-xl"
              style={{ letterSpacing: -0.3 }}>
              Location Required
            </Text>
            <Text
              className="text-text-tertiary font-quicksand max-w-sm text-center text-sm"
              style={{ letterSpacing: 0.1 }}>
              Please enable location services to discover amazing places around you.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingBottom: tabBarHeight }}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'ios' ? undefined : 'google'}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{
          flex: 1,
          position: 'absolute',
          inset: 0,
        }}
        showsUserLocation
        onMapReady={() => {
          console.log('Map is ready!');
        }}>
        <MapMarker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location">
          <Animated.View className="relative">
            <View className="bg-primary/20 absolute inset-0 h-12 w-12 rounded-full" />
            <View className="border-3 h-10 w-10 items-center justify-center rounded-full border-white bg-primary">
              <Navigation size={18} color="#fff" />
            </View>
          </Animated.View>
        </MapMarker>

        {data?.map((attraction) => (
          <MapMarker
            className="bg-background"
            key={attraction.id}
            coordinate={{
              latitude: attraction.location.latitude,
              longitude: attraction.location.longitude,
            }}
            title={attraction.name}
            description={attraction.editorialSummary?.text}
            onPress={() => {
              handleAttractionPress(attraction);
            }}>
            <View className="items-center">
              {selectedAttraction?.id === attraction.id && (
                <View className="bg-secondary/30 absolute inset-0 h-10 w-10 rounded-full" />
              )}

              <SparklesIcon size={14} color={COLORS.light.primary} />
            </View>
          </MapMarker>
        ))}
      </MapView>
      {data && (
        <AttractionCarousel
          data={data}
          setSelectedAttraction={setSelectedAttraction}
          onPressOut={(attraction) => {
            if (mapRef.current) {
              mapRef.current?.animateToRegion(
                {
                  latitude: attraction.location.latitude,
                  longitude: attraction.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }}
          onAttractionPress={handleAttractionPressOnMap}
        />
      )}

      {selectedAttraction && (
        <AttractionBottomSheet
          sheetRef={sheetRef}
          attraction={selectedAttraction}
          onClose={closeBottomSheet}
        />
      )}
    </View>
  );
}
