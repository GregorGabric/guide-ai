import { skipToken, useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { Navigation } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomTabs } from '~/src/components/bottom-tabs';
import { FloatingProfileButton } from '~/src/components/floating-profile-button';
import { LoadingOverlay } from '~/src/components/loading-overlay';
import { useSheetRef } from '~/src/components/ui/sheet';
import { api } from '~/src/convex/_generated/api';
import MapView, { MapMarker } from '../components/ui/map';
// import { Camera } from '~/src/features/camera/camera';
import { StaggeredMapMarker } from '~/src/features/maps/components/staggered-map-marker';
import { AttractionBottomSheet } from '~/src/features/places/components/attraction-bottom-sheet';
import { AttractionCarousel } from '~/src/features/places/components/attraction-carousel/attraction-carousel';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { currentLocation as getCurrentLocation } from '~/src/services/queries';

const AnimatedMapMarker = Animated.createAnimatedComponent(MapMarker);

export default function MapScreen() {
  const { data: location, isPending: isLocationPending } = useQuery(getCurrentLocation);

  const [selectedAttraction, setSelectedAttraction] = useState<
    PlacesResponse['places'][number] | null
  >(null);

  const action = useAction(api.placesActions.getNearbyPlaces);

  const placesQuery = useQuery({
    queryKey: ['places'],
    queryFn: location
      ? () => {
          return action({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      : skipToken,
  });
  const data = placesQuery.data?.places;

  const mapRef = useRef<MapView>(null);
  const sheetRef = useSheetRef();

  const [open, setOpen] = useState(false);

  const animateCameraToAttraction = (attraction: PlacesResponse['places'][number]) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          altitude: 1000,
          pitch: 60,
          center: {
            latitude: attraction.location.latitude,
            longitude: attraction.location.longitude,
          },
          zoom: 15,
        },
        { duration: 1000 }
      );
    }
  };

  // Unified attraction selection handler with smart behavior
  const handleAttractionSelection = (attraction: PlacesResponse['places'][number]) => {
    // Check if the same attraction is already selected
    if (selectedAttraction?.id === attraction.id) {
      // Same attraction - just open/focus the sheet without animating camera
      sheetRef.current?.present();

      return;
    }

    // Different attraction - set new selection, animate camera, and open sheet
    setSelectedAttraction(attraction);
    animateCameraToAttraction(attraction);
    sheetRef.current?.present();
  };

  const handleAttractionPress = (attraction: PlacesResponse['places'][number]) => {
    handleAttractionSelection(attraction);
  };

  const handleAttractionPressOnMap = (attraction: PlacesResponse['places'][number]) => {
    handleAttractionSelection(attraction);
  };

  const closeBottomSheet = () => {
    setSelectedAttraction(null);
    sheetRef.current?.dismiss();
  };

  if (isLocationPending) {
    return <LoadingOverlay message="Discovering amazing places nearby..." />;
  }

  if (!location) {
    return (
      <View className="flex-1 bg-background">
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
              }}
            >
              <Navigation size={28} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text
              className="font-quicksand-bold text-text mb-3 text-center text-xl"
              style={{ letterSpacing: -0.3 }}
            >
              Location Required
            </Text>
            <Text
              className="text-text-tertiary font-quicksand max-w-sm text-center text-sm"
              style={{ letterSpacing: 0.1 }}
            >
              Please enable location services to discover amazing places around you.
            </Text>
          </View>
        </View>

        {/* Floating Profile Button */}
        <FloatingProfileButton />
      </View>
    );
  }

  return (
    <View className="flex-1">
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
        }}
        showsScale
        showsBuildings
        showsUserLocation
      >
        <AnimatedMapMarker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        >
          <Animated.View className="relative">
            <View className="bg-primary/20 absolute inset-0 h-12 w-12 rounded-full" />
            <View className="border-3 h-10 w-10 items-center justify-center rounded-full border-white bg-primary">
              <Navigation size={18} color="#fff" />
            </View>
          </Animated.View>
        </AnimatedMapMarker>

        {data?.map((attraction, index) => (
          <StaggeredMapMarker
            key={attraction.id}
            attraction={attraction}
            index={index}
            selectedAttractionId={selectedAttraction?.id}
            onPress={() => {
              handleAttractionPress(attraction);
            }}
          />
        ))}
      </MapView>

      {data && (
        <AttractionCarousel
          data={data}
          setSelectedAttraction={setSelectedAttraction}
          onPressOut={animateCameraToAttraction}
          onAttractionPress={handleAttractionPressOnMap}
        />
      )}

      <BottomTabs
        isOpen={open}
        setOpen={setOpen}
        centerMap={() => {
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              zoom: 15,
            });
          }
        }}
      />

      {selectedAttraction && (
        <AttractionBottomSheet
          sheetRef={sheetRef}
          attraction={selectedAttraction}
          onClose={closeBottomSheet}
        />
      )}

      {/* Floating Profile Button */}
      <FloatingProfileButton />
    </View>
  );
}
