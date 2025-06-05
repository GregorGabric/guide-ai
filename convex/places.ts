import { v } from 'convex/values';
import { internalMutation, internalQuery, query } from './_generated/server';
import { placesSchema } from './schema';

// const args = {
//   latitude: v.number(),
//   longitude: v.number(),
//   radius: v.optional(v.number()),
//   maxResults: v.optional(v.number()),
//   includedTypes: v.optional(v.array(v.string())),
// };

export const savePlacesData = internalMutation({
  args: placesSchema,
  returns: v.string(),
  handler: async (ctx, args) => {
    const { places, searchParams } = args;

    if (!searchParams) {
      throw new Error('Search params are required');
    }

    const locationKey = `place-${searchParams.latitude},${searchParams.longitude},${searchParams.radius}`;

    // Check if we already have data for this location
    const existing = await ctx.db
      .query('place')
      .filter((q) => q.eq('name', locationKey))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        places: {
          places,
          searchParams,
        },
      });
      return existing._id;
    }

    // Create new record
    const id = await ctx.db.insert('place', {
      name: locationKey,
      places: {
        places,
        searchParams,
      },
    });
    return id;
  },
});

export const getPlaces = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.number(),
  },
  handler: async (ctx, args) => {
    const { latitude, longitude, radius } = args;
    const location = `place-${latitude},${longitude},${radius}`;

    const result = await ctx.db
      .query('place')
      .filter((q) => q.eq('name', location))
      .first();

    return result?.places?.places ?? [];
  },
});

export const getCachedPlaces = internalQuery({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.number(),
  },
  returns: v.union(placesSchema, v.null()),
  handler: async (ctx, args) => {
    const locationKey = `${args.latitude},${args.longitude},${args.radius}`;
    const result = await ctx.db
      .query('place')
      .filter((q) => q.eq('name', locationKey))
      .first();

    if (result) {
      return result.places;
    }

    return null;
  },
});

export type GetCachedPlacesReturn = (typeof placesSchema)['type'];
