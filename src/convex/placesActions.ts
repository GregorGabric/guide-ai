'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { placesSchema } from './schema';

const API_KEY = process.env.PLACES_API_KEY;
export const getNearbyPlaces = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()),
    maxResults: v.optional(v.number()),
    includedTypes: v.optional(v.array(v.string())),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.union(placesSchema, v.null()),
  handler: async (ctx, args) => {
    const {
      latitude,
      longitude,
      radius = 5000,
      maxResults = 20,
      // includedTypes = ['tourist_attraction'],
    } = args;

    const searchParams = { latitude, longitude, radius };

    if (!API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const requestBody = {
      includedTypes: ['tourist_attraction', 'museum', 'church', 'park', 'zoo'],
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      maxResultCount: Number(maxResults),
    };

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
    ].join(',');

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Places API error: ${response.status} - ${errorText}`);
    }

    const apiResponse = (await response.json()) as (typeof placesSchema)['type'];

    return { places: apiResponse.places ?? [], searchParams };
  },
});

export const getPlacesPhotoUrl = action({
  args: {
    photoName: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    if (!API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const url = `https://places.googleapis.com/v1/${args.photoName}/media?key=${API_KEY}&maxWidthPx=200`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return response.url;
  },
});
