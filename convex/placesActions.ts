'use node';

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action } from './_generated/server';
import type { GetCachedPlacesReturn } from './places';
import { placesSchema } from './schema';

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
      forceRefresh = false,
    } = args;

    console.log(latitude, longitude, radius, 'args');

    const API_KEY = process.env.PLACES_API_KEY;
    const searchParams = { latitude, longitude, radius };

    // Check if we have cached data (unless forcing refresh)
    if (!forceRefresh) {
      try {
        const cached = await ctx.runQuery(internal.places.getCachedPlaces, searchParams);

        const typeCached = cached as GetCachedPlacesReturn | null;

        if (typeCached) {
          return {
            places: typeCached.places,
            searchParams,
          };
        }
      } catch (error) {
        // Continue to fetch fresh data if cache fails
        console.warn('Failed to get cached places:', error);
      }
    }

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

    // await ctx.runMutation(internal.places.savePlacesData, {
    //   places: apiResponse.places,
    //   searchParams,
    // });

    return { places: apiResponse.places ?? [], searchParams };
  },
});
