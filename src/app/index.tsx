import { skipToken, useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';

import { IconMap2 } from '@tabler/icons-react-native';
import { useRef, useState } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import type NativeMapView from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { BottomTabs } from '~/src/components/bottom-tabs';
import { FloatingProfileButton } from '~/src/components/floating-profile-button';
import { LoadingOverlay } from '~/src/components/loading-overlay';
import { useSheetRef } from '~/src/components/ui/sheet';
import { api } from '~/src/convex/_generated/api';
import { StaggeredMapMarker } from '~/src/features/maps/components/staggered-map-marker';
import { AttractionBottomSheet } from '~/src/features/places/components/attraction-bottom-sheet';
import { AttractionCarousel } from '~/src/features/places/components/attraction-carousel/attraction-carousel';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { useSheetStore } from '~/src/features/places/store';
import { currentLocation as getCurrentLocation } from '~/src/services/queries';
import { colors } from '~/src/utils/theme';
import { MapView } from '../components/ui/map.native';
import { Text } from '../components/ui/text';

export default function MapScreen() {
  const { data: location, isPending: isLocationPending } = useQuery(getCurrentLocation);
  const isSheetOpen = useSheetStore((state) => state.isOpen);
  const mapRef = useRef<NativeMapView>(null);
  const sheetRef = useSheetRef();
  const [open, setOpen] = useState(false);
  const bottomSheetPosition = useSharedValue<number>(0);
  const dimensions = useWindowDimensions();

  const [selectedAttraction, setSelectedAttraction] = useState<
    PlacesResponse['places'][number] | null
  >(null);

  const action = useAction(api.placesActions.getNearbyPlaces);

  const placesQuery = useQuery({
    queryKey: ['places', location?.coords.latitude, location?.coords.longitude],
    queryFn: location
      ? ({ queryKey }) => {
          const [_id, latitude, longitude] = queryKey;
          return action({
            latitude: latitude as number,
            longitude: longitude as number,
          });
        }
      : skipToken,
    select(data) {
      return data.places;
    },
  });
  const attractions = placesQuery.data;

  const mapAnimatedStyle = useAnimatedStyle(() => {
    const currentPosition = bottomSheetPosition.value;
    const sheetShouldBeOpen = isSheetOpen;

    // If sheet is not supposed to be open, use full height
    if (!sheetShouldBeOpen) {
      return {
        height: dimensions.height,
      };
    }

    // bottomSheetPosition represents Y coordinate of sheet's top edge
    // Higher values = sheet is lower/more closed, map should be larger
    // Lower values = sheet is higher/more open, map should be smaller

    // When sheet is effectively closed (position near screen height), use full screen
    const isSheetClosed = currentPosition >= dimensions.height * 0.9;

    // For open/opening states, the map height should be the position value
    // (since position is where the sheet top starts)
    // But ensure minimum height when sheet is opening (position might be 0 initially)
    const height = isSheetClosed
      ? dimensions.height
      : Math.max(currentPosition, dimensions.height * 0.35); // Minimum 35% of screen height

    return {
      height,
    };
  });

  const animateCameraToAttraction = (attraction: PlacesResponse['places'][number]) => {
    if (mapRef.current && attraction.location.latitude && attraction.location.longitude) {
      if (open) {
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
          { duration: 500 }
        );
        return;
      }

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
        {
          duration: 1000,
        }
      );
    }
  };

  const handleAttractionSelection = (attraction: PlacesResponse['places'][number]) => {
    if (selectedAttraction?.id === attraction.id) {
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
            <View className="bg-primary/10 border-primary/5 mb-8 h-20 w-20 items-center justify-center rounded-3xl border">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                <IconMap2 size={24} color={colors.background} />
              </View>
            </View>
            <Text variant={'largeTitle'} className="mb-4 text-center">
              Location Required
            </Text>
            <Text className="text-center" variant={'body'}>
              Please enable location services to discover amazing places around you.
            </Text>
          </View>
        </View>

        <FloatingProfileButton />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Animated.View style={mapAnimatedStyle}>
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
          showsBuildings
          showsUserLocation
          showsCompass={false}
        >
          {attractions?.map((attraction, index) => (
            <StaggeredMapMarker
              key={attraction.id}
              isSelected={selectedAttraction?.id === attraction.id}
              attraction={attraction}
              index={index}
              count={attractions.length}
              onPress={() => {
                handleAttractionPress(attraction);
              }}
            />
          ))}
        </MapView>
      </Animated.View>

      {(attractions?.length ?? 0) > 0 && (
        <AttractionCarousel
          data={attractions}
          setSelectedAttraction={setSelectedAttraction}
          onPressOut={animateCameraToAttraction}
          onAttractionPress={handleAttractionPressOnMap}
          mapRef={mapRef}
          selectedAttraction={selectedAttraction}
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
          animatedPosition={bottomSheetPosition}
        />
      )}

      {/* Floating Profile Button */}
      <FloatingProfileButton />
    </View>
  );
}
