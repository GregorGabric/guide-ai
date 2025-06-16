import { v } from 'convex/values';
import { internalMutation } from './_generated/server';
import { placesSchema } from './schema';

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
