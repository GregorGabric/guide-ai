import { IconWorld } from '@tabler/icons-react-native';
import { useQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSheetRef } from '~/src/components/ui/sheet';
import { H3, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { colors } from '~/src/utils/theme';
import type { Region } from '../components/ui/map';
import MapView, { MapMarker } from '../components/ui/map';

const isAndroid = Platform.OS === 'android';

// Zoom threshold - when latitudeDelta is greater than this, show clustered marker
const CLUSTER_ZOOM_THRESHOLD = 10;

export default function VisitedPlacesScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  // Query visited places and stats
  const visitedPlaces = useQuery(api.visitedPlaces.getVisitedPlaces) ?? [];

  const _stats = useQuery(api.visitedPlaces.getVisitStats);

  // Calculate map region based on visited places
  const getMapRegion = () => {
    if (visitedPlaces.length === 0) {
      // Default to world view
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 80,
        longitudeDelta: 80,
      };
    }

    // Calculate bounds of all visited places
    const latitudes = visitedPlaces.map((place) => place.latitude);
    const longitudes = visitedPlaces.map((place) => place.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = Math.max(maxLat - minLat, 0.1) * 1.2; // Add padding
    const lngDelta = Math.max(maxLng - minLng, 0.1) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  // Calculate center point of all visited places for clustering
  const getCenterPoint = () => {
    if (visitedPlaces.length === 0) {
      return null;
    }

    const totalLat = visitedPlaces.reduce((sum, place) => sum + place.latitude, 0);
    const totalLng = visitedPlaces.reduce((sum, place) => sum + place.longitude, 0);

    return {
      latitude: totalLat / visitedPlaces.length,
      longitude: totalLng / visitedPlaces.length,
    };
  };

  // Determine if we should show clustered or individual markers
  const shouldShowCluster = currentRegion
    ? currentRegion.latitudeDelta > CLUSTER_ZOOM_THRESHOLD
    : true; // Default to cluster view

  const centerPoint = getCenterPoint();

  const insets = useSafeAreaInsets();

  const sheetRef = useSheetRef();

  // // Present the sheet when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      sheetRef.current?.present();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [sheetRef]);

  // const tabBarHeight = useBottomTabBarHeight();

  return (
    <View className="flex-1 px-10" style={{ paddingBottom: insets.bottom }}>
      {/* <Sheet
        enableDynamicSizing={false}
        bottomInset={insets.bottom}
        topInset={insets.top}
        style={{
          borderCurve: 'continuous',
          borderRadius: 47,
          zIndex: 10,
        }}
        ref={sheetRef}
        enablePanDownToClose
        enableBlurKeyboardOnGesture
        enableOverDrag={false}
        backgroundStyle={{
          borderRadius: 47,
          backgroundColor: colors['card-background'],
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        snapPoints={[insets.bottom + 60, '85%']}
        animateOnMount
      >
        <View className="flex-1">
          <Text>Hello</Text>
        </View>
      </Sheet> */}

      {/* Map View */}
      <View className="flex-1">
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'ios' ? undefined : 'google'}
          mapType={isAndroid ? 'satellite' : 'hybridFlyover'}
          initialRegion={getMapRegion()}
          onRegionChangeComplete={setCurrentRegion}
          style={{
            flex: 1,
          }}
          showsScale
          showsBuildings
          showsUserLocation={false}
        >
          {shouldShowCluster && centerPoint && visitedPlaces.length > 0 ? (
            // Clustered marker when zoomed out
            <MapMarker
              coordinate={centerPoint}
              title={`${visitedPlaces.length} Visited Places`}
              description="Zoom in to see individual locations"
              onPress={() => {
                // Zoom to fit all markers
                if (mapRef.current && visitedPlaces.length > 0) {
                  const coordinates = visitedPlaces.map((place) => ({
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }));
                  mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                }
              }}
            >
              <View
                className="items-center justify-center rounded-full bg-primary p-3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  minWidth: 50,
                  minHeight: 50,
                }}
              >
                <Text className="text-lg font-bold text-white">{visitedPlaces.length}</Text>
              </View>
            </MapMarker>
          ) : (
            // Individual markers when zoomed in
            visitedPlaces.map((visit) => (
              <MapMarker
                key={visit._id}
                coordinate={{
                  latitude: visit.latitude,
                  longitude: visit.longitude,
                }}
                title={visit.placeName}
                description={`Visited ${new Date(visit.visitedAt).toLocaleDateString()}`}
                onPress={() => {
                  setSelectedVisit(visit._id);
                }}
              >
                <View
                  className={`items-center justify-center rounded-full p-2`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <IconWorld
                    size={16}
                    color={selectedVisit === visit._id ? '#fff' : colors.primary}
                  />
                </View>
              </MapMarker>
            ))
          )}
        </MapView>
      </View>

      {visitedPlaces.length === 0 && (
        <View className="absolute inset-0 items-center justify-center px-6">
          <View className="items-center">
            <View className="bg-muted/20 mb-6 h-20 w-20 items-center justify-center rounded-3xl">
              <IconWorld size={28} color={colors.accent} strokeWidth={2} />
            </View>
            <H3 className="mb-3 text-center">Start Exploring</H3>
            <P className="max-w-sm text-center text-muted-foreground">
              Open attraction details to automatically track your visits, or add places manually.
            </P>
          </View>
        </View>
      )}
    </View>
  );
}
