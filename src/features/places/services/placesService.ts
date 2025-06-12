import type { PlacesResponse } from '~/services/places/types';

// Base URL for Google Places API (New)
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1/places';

const API_KEY = process.env.PLACES_API_KEY;

// Common place types for tourism
export const PLACE_TYPES = {
  TOURIST_ATTRACTION: 'tourist_attraction',
  MUSEUM: 'museum',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  SHOPPING_MALL: 'shopping_mall',
  PARK: 'park',
  CHURCH: 'church',
  LODGING: 'lodging',
  NIGHT_CLUB: 'night_club',
  BAR: 'bar',
  AMUSEMENT_PARK: 'amusement_park',
  ZOO: 'zoo',
  AQUARIUM: 'aquarium',
  ART_GALLERY: 'art_gallery',
  CASINO: 'casino',
  MOVIE_THEATER: 'movie_theater',
  STADIUM: 'stadium',
} as const;

// Types for the Google Places API
export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

export interface PlaceDisplayName {
  text: string;
  languageCode: string;
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

export interface PlaceOpeningHours {
  openNow: boolean;
  periods: Array<{
    open: {
      day: number;
      hour: number;
      minute: number;
    };
    close?: {
      day: number;
      hour: number;
      minute: number;
    };
  }>;
  weekdayDescriptions: Array<string>;
}

export interface GooglePlace {
  id: string;
  name: string;
  displayName: PlaceDisplayName;
  types: Array<string>;
  location: PlaceLocation;
  rating?: number;
  userRatingCount?: number;
  priceLevel?:
    | 'PRICE_LEVEL_FREE'
    | 'PRICE_LEVEL_INEXPENSIVE'
    | 'PRICE_LEVEL_MODERATE'
    | 'PRICE_LEVEL_EXPENSIVE'
    | 'PRICE_LEVEL_VERY_EXPENSIVE';
  formattedAddress?: string;
  websiteUri?: string;
  internationalPhoneNumber?: string;
  photos?: Array<PlacePhoto>;
  regularOpeningHours?: PlaceOpeningHours;
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
}

export interface NearbySearchRequest {
  includedTypes: Array<(typeof PLACE_TYPES)[keyof typeof PLACE_TYPES]>;
  excludedTypes?: Array<string>;
  maxResultCount?: number;
  locationRestriction: {
    circle: {
      center: PlaceLocation;
      radius: number;
    };
  };
  languageCode?: string;
  rankPreference?: 'POPULARITY' | 'DISTANCE';
}

export interface NearbySearchResponse {
  places: PlacesResponse['places'];
}

export interface PlaceDetailsRequest {
  placeId: string;
  languageCode?: string;
}

// Simple API key check for development
export const hasGooglePlacesApiKey = (): boolean => {
  return !!API_KEY;
};

// Helper function to make API requests
const makeGooglePlacesRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  fieldMask?: string
): Promise<T> => {
  if (!API_KEY) {
    throw new Error(
      'Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your environment.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
  };

  if (fieldMask) {
    headers['X-Goog-FieldMask'] = fieldMask;
  }

  const response = await fetch(`${PLACES_API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Search for nearby places
export const searchNearbyPlaces = async (
  request: NearbySearchRequest
): Promise<PlacesResponse['places']> => {
  try {
    const fieldMask = [
      'places.id',
      'places.name',
      'places.displayName',
      'places.types',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.formattedAddress',
      'places.photos',
      'places.editorialSummary',
      'places.addressDescriptor',
      'places.addressComponents',
    ].join(',');

    const response = await makeGooglePlacesRequest<NearbySearchResponse>(
      ':searchNearby',
      'POST',
      request,
      fieldMask
    );

    return response.places || [];
  } catch (error) {
    console.error('Error searching nearby places:', error);
    throw error;
  }
};

// Get detailed information about a specific place
export const getPlaceDetails = async (
  request: PlaceDetailsRequest
): Promise<GooglePlace | null> => {
  try {
    const fieldMask = [
      'id',
      'name',
      'displayName',
      'types',
      'location',
      'rating',
      'userRatingCount',
      'priceLevel',
      'formattedAddress',
      'websiteUri',
      'internationalPhoneNumber',
      'photos',
      'regularOpeningHours',
      'editorialSummary',
    ].join(',');

    const response = await makeGooglePlacesRequest<GooglePlace>(
      `/${request.placeId}`,
      'GET',
      undefined,
      fieldMask
    );

    return response;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Search for restaurants near a location
export const searchNearbyRestaurants = async (
  center: PlaceLocation,
  radius = 1000,
  maxResults = 20
): Promise<PlacesResponse['places']> => {
  return searchNearbyPlaces({
    includedTypes: [PLACE_TYPES.RESTAURANT, PLACE_TYPES.CAFE],
    maxResultCount: maxResults,
    locationRestriction: {
      circle: { center, radius },
    },
    rankPreference: 'POPULARITY',
  });
};

// Search for tourist attractions near a location
export const searchNearbyAttractions = async (
  center: PlaceLocation,
  radius = 5000,
  maxResults = 20
): Promise<PlacesResponse['places']> => {
  return searchNearbyPlaces({
    includedTypes: [
      PLACE_TYPES.TOURIST_ATTRACTION,
      PLACE_TYPES.MUSEUM,
      PLACE_TYPES.PARK,
      PLACE_TYPES.AMUSEMENT_PARK,
      PLACE_TYPES.ZOO,
      PLACE_TYPES.AQUARIUM,
      PLACE_TYPES.ART_GALLERY,
    ],
    maxResultCount: maxResults,
    locationRestriction: {
      circle: { center, radius },
    },
    rankPreference: 'POPULARITY',
  });
};

// Search for accommodations near a location
export const searchNearbyLodging = async (
  center: PlaceLocation,
  radius = 2000,
  maxResults = 20
): Promise<PlacesResponse['places']> => {
  return searchNearbyPlaces({
    includedTypes: [PLACE_TYPES.LODGING],
    maxResultCount: maxResults,
    locationRestriction: {
      circle: { center, radius },
    },
    rankPreference: 'POPULARITY',
  });
};

// Search for places by type with custom parameters
export const searchPlacesByType = async (
  placeTypes: Array<(typeof PLACE_TYPES)[keyof typeof PLACE_TYPES]>,
  center: PlaceLocation,
  radius = 1000,
  maxResults = 20,
  rankBy: 'POPULARITY' | 'DISTANCE' = 'POPULARITY'
): Promise<PlacesResponse['places']> => {
  return searchNearbyPlaces({
    includedTypes: placeTypes,
    maxResultCount: maxResults,
    locationRestriction: {
      circle: { center, radius },
    },
    rankPreference: rankBy,
  });
};

// Get a photo URL for a place photo
export const getPlacePhotoUrl = (photoName: string, maxWidth = 400, maxHeight = 400): string => {
  // This would typically require another API call to get the actual photo
  // For now, return the photo name that can be used with the Photos API
  return `${PLACES_API_BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;
};

// Validate if a place type is supported
export const isValidPlaceType = (placeType: string): boolean => {
  return Object.values(PLACE_TYPES).includes(placeType as any);
};

// Get all available place types
export const getAvailablePlaceTypes = (): Array<string> => {
  return Object.values(PLACE_TYPES);
};
