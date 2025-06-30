import { skipToken, useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';

import { useRef, useState } from 'react';
import { Dimensions, Platform, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { BottomTabs } from '~/src/components/bottom-tabs';
import { FloatingProfileButton } from '~/src/components/floating-profile-button';
import { LoadingOverlay } from '~/src/components/loading-overlay';
import { useSheetRef } from '~/src/components/ui/sheet';
import { api } from '~/src/convex/_generated/api';
import { MapMarker, MapView } from '../components/ui/map.native';
// import { Camera } from '~/src/features/camera/camera';
import { IconNavigation } from '@tabler/icons-react-native';
import type NativeMapView from 'react-native-maps';
import { StaggeredMapMarker } from '~/src/features/maps/components/staggered-map-marker';
import {
  AttractionBottomSheet,
  useSheetStore,
} from '~/src/features/places/components/attraction-bottom-sheet';
import { AttractionCarousel } from '~/src/features/places/components/attraction-carousel/attraction-carousel';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { currentLocation as getCurrentLocation } from '~/src/services/queries';
const AnimatedMapMarker = Animated.createAnimatedComponent(MapMarker);
const { height } = Dimensions.get('window');

export default function MapScreen() {
  const { data: location, isPending: isLocationPending } = useQuery(getCurrentLocation);
  const isSheetOpen = useSheetStore((state) => state.isOpen);

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

  const mapRef = useRef<NativeMapView>(null);
  const sheetRef = useSheetRef();

  const [open, setOpen] = useState(false);
  const bottomSheetPosition = useSharedValue<number>(0);

  const dimensions = useWindowDimensions();

  const mapAnimatedStyle = useAnimatedStyle(() => {
    const currentPosition = bottomSheetPosition.value;
    const sheetShouldBeOpen = isSheetOpen;

    console.log(
      '🎨 mapAnimatedStyle - position:',
      currentPosition,
      'sheetOpen:',
      sheetShouldBeOpen
    );

    // If sheet is not supposed to be open, use full height
    if (!sheetShouldBeOpen) {
      console.log('📐 Sheet not open - using full height:', dimensions.height);
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

    console.log(
      '📐 Calculated height:',
      height,
      'Sheet closed:',
      isSheetClosed,
      'Position:',
      currentPosition
    );

    return {
      height: height,
    };
  });

  const animateCameraToAttraction = (attraction: PlacesResponse['places'][number]) => {
    console.log('🎬 animateCameraToAttraction called for:', attraction.displayName.text);

    if (mapRef.current && attraction.location?.latitude && attraction.location?.longitude) {
      console.log('📍 Animating camera to location:', {
        lat: attraction.location.latitude,
        lng: attraction.location.longitude,
        open: open,
      });

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

      // Animate to location and then signal completion for panning to start
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

      console.log('✅ Initial camera animation started, panning will begin when sheet opens');
    } else {
      console.log('❌ Cannot animate camera - missing mapRef or location data');
    }
  };

  const handleAttractionSelection = (attraction: PlacesResponse['places'][number]) => {
    if (selectedAttraction?.id === attraction.id) {
      sheetRef.current?.present();
      return;
    }

    console.log('🆕 New attraction selected, animating camera and opening sheet');
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
    console.log('🚪 Closing bottom sheet');
    setSelectedAttraction(null);
    sheetRef.current?.dismiss();
  };

  // Filter and type guard for valid attractions
  const validAttractions =
    data?.filter(
      (
        attraction
      ): attraction is PlacesResponse['places'][number] & {
        name: string;
        location: { latitude: number; longitude: number };
      } =>
        Boolean(attraction.name && attraction.location?.latitude && attraction.location?.longitude)
    ) ?? [];

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
              <IconNavigation size={28} color="#F59E0B" strokeWidth={2.5} />
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
      {/* Animated Map Container */}
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
        >
          <AnimatedMapMarker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          >
            <View className="size-11 items-center justify-center rounded-full border-2 border-white bg-primary">
              <IconNavigation size={18} color="#fff" />
            </View>
          </AnimatedMapMarker>

          {validAttractions.map((attraction, index) => (
            <StaggeredMapMarker
              key={attraction.id}
              isSelected={selectedAttraction?.id === attraction.id}
              attraction={attraction}
              index={index}
              count={validAttractions.length}
              onPress={() => {
                handleAttractionPress(attraction);
              }}
            />
          ))}
        </MapView>
      </Animated.View>

      {validAttractions.length > 0 && (
        <AttractionCarousel
          data={validAttractions}
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
