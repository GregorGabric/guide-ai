'use node';

import { v } from 'convex/values';
import { internal } from './_generated/api';
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
  },
  returns: v.union(placesSchema, v.null()),
  handler: async (_ctx, args) => {
    const { latitude, longitude, radius = 5000, maxResults = 20 } = args;

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
      rankPreference: 'DISTANCE',
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
    googleMapsUri: v.string(),
    maxWidthPx: v.optional(v.number()),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const { photoName, maxWidthPx = 200, googleMapsUri } = args;

    if (!API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    // Check cache first - this saves money!
    console.log(`🔍 Looking for cached photo: ${photoName} (size: ${maxWidthPx}px)`);

    const cached = (await ctx.runQuery(internal.photoCache.getCachedPhoto, {
      photoName,
      maxWidthPx,
      googleMapsUri,
    })) as {
      photoUrl: string;
      expiresAt: number;
      photoName: string;
    };

    if (cached) {
      console.log(`🔍 Found cached photo, expires at: ${new Date(cached.expiresAt).toISOString()}`);

      if (cached.expiresAt > Date.now()) {
        console.log(`📸 Cache hit for photo: ${photoName} (saved API cost!)`);
        // Update request count for analytics
        await ctx.runMutation(internal.photoCache.incrementPhotoRequestCount, {
          photoName,
          maxWidthPx,
          googleMapsUri,
        });
        return cached.photoUrl;
      } else {
        console.log(`⏰ Cache expired for photo: ${photoName}`);
      }
    } else {
      console.log(`❌ No cached photo found for: ${photoName}`);
    }

    console.log(`📸 Cache miss, fetching from Google API: ${photoName}`);

    const url = `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxWidthPx=${maxWidthPx}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`❌ Google Photos API error: ${response.status}`);
        return null;
      }

      const photoUrl = response.url;

      // Cache the result for 7 days to avoid future API costs
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await ctx.runMutation(internal.photoCache.cachePhoto, {
        photoName,
        photoUrl,
        maxWidthPx,
        expiresAt,
        googleMapsUri,
      });

      console.log(`📸 Cached photo URL for 7 days: ${photoName}`);
      return photoUrl;
    } catch (error) {
      console.error(`❌ Error fetching photo ${photoName}:`, error);
      return null;
    }
  },
});
