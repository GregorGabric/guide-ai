import { useQuery } from 'convex/react';
import { useRef, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import type NativeMapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapMarker, MapView } from '~/src/components/ui/map.native';
import { ScrollView } from '~/src/components/ui/scroll-view';
import { Text } from '~/src/components/ui/text';
import { H4 } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { cn } from '~/src/lib/utils';

type ViewMode = 'map' | 'list';

type VisitedPlace = {
  _id: string;
  placeName: string;
  placeAddress?: string;
  latitude: number;
  longitude: number;
  visitedAt: number;
  notes?: string;
  country?: string;
};

export default function VisitedPlacesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const insets = useSafeAreaInsets();
  const mapRef = useRef<NativeMapView>(null);

  const visitedPlaces = useQuery(api.visitedPlaces.getVisitedPlaces);
  const visitStats = useQuery(api.visitedPlaces.getVisitStats);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const animateCameraToPlace = (place: VisitedPlace) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          altitude: 1000,
          pitch: 60,
          center: {
            latitude: place.latitude,
            longitude: place.longitude,
          },
          zoom: 15,
        },
        { duration: 1000 }
      );
    }
  };

  const handlePlacePress = (place: VisitedPlace) => {
    if (viewMode === 'list') {
      setViewMode('map');
    }
    animateCameraToPlace(place);
  };

  if (visitedPlaces === undefined || visitStats === undefined) {
    return (
      <View className="flex-1">
        <View className="flex-1 bg-gray-100">
          <View className="h-80 animate-pulse bg-gray-200" />
        </View>

        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>

          <View className="px-6 pb-4">
            <View className="mb-2 h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
            <View className="bg-gray-150 h-4 w-32 animate-pulse rounded" />
          </View>

          <View className="mx-4 mb-4 h-14 animate-pulse rounded-2xl bg-gray-200" />

          <View className="px-4 pb-4">
            <View className="bg-gray-150 h-12 animate-pulse rounded-xl" />
          </View>

          <View className="gap-3 px-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="rounded-lg bg-gray-100 p-4">
                <View className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <View className="bg-gray-150 mb-1 h-4 w-1/2 animate-pulse rounded" />
                <View className="bg-gray-150 h-3 w-1/4 animate-pulse rounded" />
              </View>
            ))}
          </View>

          <View className="items-center px-4 pt-6">
            <View className="flex-row items-center space-x-2">
              <View className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <View
                className="h-2 w-2 animate-pulse rounded-full bg-gray-300"
                style={{ animationDelay: '0.2s' }}
              />
              <View
                className="h-2 w-2 animate-pulse rounded-full bg-gray-300"
                style={{ animationDelay: '0.4s' }}
              />
            </View>
            <Text variant="footnote" color="tertiary" className="mt-3">
              Loading your travel memories...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const stats = {
    countriesVisited: visitStats?.countriesVisited.length || 0,
    citiesVisited: visitStats?.citiesVisited.length || 0,
    totalTrips: visitStats?.totalVisits || 0,
  };

  return (
    <View className="flex-1 ">
      <MapView
        ref={mapRef}
        mapType={Platform.OS === 'ios' ? 'hybridFlyover' : 'satellite'}
        initialRegion={{
          latitude: visitedPlaces.length > 0 ? visitedPlaces[0].latitude : 20,
          longitude: visitedPlaces.length > 0 ? visitedPlaces[0].longitude : 0,
          latitudeDelta: 80,
          longitudeDelta: 80,
        }}
        style={{ flex: 1 }}
        showsScale
        showsBuildings
      >
        {visitedPlaces.map((place) => (
          <MapMarker
            key={place._id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.placeName}
            description={place.placeAddress || place.country || 'Unknown location'}
            onPress={() => {
              handlePlacePress(place);
            }}
          />
        ))}
      </MapView>

      <View
        className="bg-background"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: insets.bottom,
        }}
      >
        <View className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-gray-300" />
        </View>

        <View className="px-6 pb-4">
          <Text variant={'largeTitle'} className="mb-1 ">
            My Travels
          </Text>
          <Text variant="subhead" color="tertiary">
            {stats.countriesVisited} countries • {stats.citiesVisited} cities
          </Text>
        </View>

        {visitedPlaces.length > 0 ? (
          <>
            <View className="mx-4 mb-4 rounded-2xl bg-primary p-4">
              <Text variant="body" className="text-center font-bold text-foreground">
                {stats.countriesVisited} Countries • {stats.citiesVisited} Cities
              </Text>
            </View>

            <View className="px-4 pb-4">
              <View className="flex-row rounded-xl bg-card p-1">
                <TouchableOpacity
                  className={cn(
                    'flex-1 items-center justify-center rounded-lg py-3',
                    viewMode === 'map' && 'bg-primary'
                  )}
                  onPress={() => {
                    setViewMode('map');
                  }}
                >
                  <Text
                    variant="callout"
                    className={viewMode === 'map' ? 'text-background' : 'text-foreground'}
                  >
                    Map
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={cn(
                    'flex-1 items-center justify-center rounded-lg py-3',
                    viewMode === 'list' && 'bg-primary'
                  )}
                  onPress={() => {
                    setViewMode('list');
                  }}
                >
                  <Text
                    variant="callout"
                    className={viewMode === 'list' ? 'text-background' : 'text-foreground'}
                  >
                    List
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {viewMode === 'list' && (
              <ScrollView className="max-h-60 px-4">
                {visitedPlaces.map((visit) => (
                  <TouchableOpacity
                    key={visit._id}
                    className="mb-3 rounded-lg bg-card p-4"
                    onPress={() => {
                      handlePlacePress(visit);
                    }}
                  >
                    <H4 className="mb-1">{visit.placeName}</H4>
                    <Text variant="subhead" color="tertiary">
                      {visit.placeAddress || visit.country || 'Unknown location'}
                    </Text>
                    <Text variant="footnote" color="quarternary">
                      {formatDate(visit.visitedAt)}
                    </Text>
                    {visit.notes && (
                      <Text variant="footnote" className="mt-1">
                        {visit.notes}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <View className="px-4 pb-8">
            <View className="items-center py-8">
              <Text variant="body" color="secondary">
                No travels recorded yet
              </Text>
              <Text variant="subhead" color="tertiary" className="mt-2 text-center">
                Start exploring places and they&apos;ll appear here automatically!
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
