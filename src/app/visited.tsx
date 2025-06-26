import { useRef, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapMarker, MapView } from '~/src/components/ui/map.native';
import { ScrollView } from '~/src/components/ui/scroll-view';
import { H2, H4 } from '~/src/components/ui/typography';
import { cn } from '~/src/lib/utils';

// Placeholder data for visited places
const PLACEHOLDER_DATA = {
  stats: {
    countriesVisited: 23,
    totalCountries: 195,
    citiesVisited: 67,
    continentsVisited: 5,
    totalContinents: 7,
    totalTrips: 34,
    totalMiles: 156780,
    favoriteMonth: 'September',
  },
  visitedPlaces: [
    {
      _id: '1',
      placeName: 'Paris, France',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      visitedAt: '2024-06-15',
      notes: 'Amazing trip to the City of Light!',
      category: 'City',
      duration: 5,
      rating: 5,
    },
    {
      _id: '2',
      placeName: 'Tokyo, Japan',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      visitedAt: '2024-03-22',
      notes: 'Incredible culture and food',
      category: 'City',
      duration: 8,
      rating: 5,
    },
  ],
};

type ViewMode = 'map' | 'list';

export default function VisitedPlacesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const insets = useSafeAreaInsets();
  const mapRef = useRef<typeof MapView>(null);
  const { stats, visitedPlaces } = PLACEHOLDER_DATA;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-1 ">
      <MapView
        ref={mapRef}
        mapType={Platform.OS === 'ios' ? 'hybridFlyover' : 'satellite'}
        initialRegion={{
          latitude: 20,
          longitude: 0,
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
            description={place.country}
          />
        ))}
      </MapView>

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
          <H2 className="mb-1 text-foreground">My Travels</H2>
          <Text className="text-sm text-muted-foreground">
            {stats.countriesVisited} countries • {stats.citiesVisited} cities
          </Text>
        </View>

        <View className="mx-4 mb-4 rounded-2xl bg-primary p-4">
          <Text className="text-center text-lg font-bold text-white">
            {stats.countriesVisited} Countries • {stats.citiesVisited} Cities
          </Text>
        </View>

        <View className="px-4 pb-4">
          <View className="flex-row rounded-xl bg-gray-100 p-1">
            <TouchableOpacity
              className={cn(
                'flex-1 items-center justify-center rounded-lg py-3',
                viewMode === 'map' && 'bg-primary'
              )}
              onPress={() => {
                setViewMode('map');
              }}
            >
              <Text className={viewMode === 'map' ? 'text-white' : 'text-black'}>Map</Text>
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
              <Text className={viewMode === 'list' ? 'text-white' : 'text-black'}>List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'list' && (
          <ScrollView className="max-h-60 px-4">
            {visitedPlaces.map((visit) => (
              <View key={visit._id} className="mb-3 rounded-lg bg-gray-50 p-4">
                <H4 className="mb-1">{visit.placeName}</H4>
                <Text className="text-sm text-gray-600">{visit.country}</Text>
                <Text className="text-sm text-gray-500">{formatDate(visit.visitedAt)}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
