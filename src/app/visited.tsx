import { useQuery } from 'convex/react';
import { Globe } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import MapView, { MapMarker, Region } from 'react-native-maps';
import { Badge } from '~/src/components/ui/badge';
import { H3, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { colors } from '~/src/utils/theme';

const isAndroid = Platform.OS === 'android';

// Zoom threshold - when latitudeDelta is greater than this, show clustered marker
const CLUSTER_ZOOM_THRESHOLD = 10;

export default function VisitedPlacesScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  // Query visited places and stats
  const visitedPlaces = useQuery(api.visitedPlaces.getVisitedPlaces) ?? [];
  const stats = useQuery(api.visitedPlaces.getVisitStats);

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

  return (
    <View className="flex-1 bg-background">
      {/* <Header title="Visited Places" showBackButton /> */}

      {/* Stats Header */}
      <View className="border-border/20 border-b bg-background px-6 py-4">
        <View className="mb-3 flex-row items-center gap-4">
          <View className="bg-primary/10 h-12 w-12 items-center justify-center rounded-2xl">
            <Globe size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <H3>Your Travel Journey</H3>
            <P className="text-muted-foreground">
              {stats?.totalVisits || 0} visits • {stats?.uniquePlaces || 0} places
            </P>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3">
          <Badge variant="secondary" className="flex-row items-center gap-2">
            <Text className="text-sm font-medium">
              {stats?.countriesVisited.length || 0} Countries
            </Text>
          </Badge>
          <Badge variant="secondary" className="flex-row items-center gap-2">
            <Text className="text-sm font-medium">{stats?.citiesVisited.length || 0} Cities</Text>
          </Badge>
        </View>
      </View>

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
                  className={`items-center justify-center rounded-full p-2 ${
                    selectedVisit === visit._id
                      ? 'scale-125 bg-primary'
                      : 'border-2 border-primary bg-white'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Globe size={16} color={selectedVisit === visit._id ? '#fff' : colors.primary} />
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
              <Globe size={28} color={colors.accent} strokeWidth={2} />
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
