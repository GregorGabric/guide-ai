import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

// Internal query to get cached photo
export const getCachedPhoto = internalQuery({
  args: {
    googleMapsUri: v.string(),
    maxWidthPx: v.number(),
    photoName: v.string(),
  },
  returns: v.union(
    v.object({
      photoName: v.string(),
      photoUrl: v.string(),
      expiresAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const photo = await ctx.db
      .query('photoCache')
      .withIndex('by_google_maps_uri_and_size', (q) =>
        q.eq('googleMapsUri', args.googleMapsUri).eq('maxWidthPx', args.maxWidthPx)
      )
      .first();

    if (!photo) {
      return null;
    }

    return {
      photoUrl: photo.photoUrl,
      expiresAt: photo.expiresAt,
      photoName: photo.photoName,
    };
  },
});

// Internal mutation to cache photo
export const cachePhoto = internalMutation({
  args: {
    photoName: v.string(),
    googleMapsUri: v.string(),
    photoUrl: v.string(),
    maxWidthPx: v.number(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query('photoCache')
      .withIndex('by_google_maps_uri_and_size', (q) =>
        q.eq('googleMapsUri', args.googleMapsUri).eq('maxWidthPx', args.maxWidthPx)
      )
      .first();

    if (existing) {
      // Update existing cache entry
      await ctx.db.patch(existing._id, {
        photoUrl: args.photoUrl,
        cachedAt: Date.now(),
        expiresAt: args.expiresAt,
        requestCount: (existing.requestCount || 0) + 1,
      });
    } else {
      // Create new cache entry
      await ctx.db.insert('photoCache', {
        photoName: args.photoName,
        googleMapsUri: args.googleMapsUri,
        photoUrl: args.photoUrl,
        cachedAt: Date.now(),
        expiresAt: args.expiresAt,
        maxWidthPx: args.maxWidthPx,
        requestCount: 1,
      });
    }
  },
});

// Internal mutation to increment request count for analytics
export const incrementPhotoRequestCount = internalMutation({
  args: {
    googleMapsUri: v.string(),
    maxWidthPx: v.number(),
    photoName: v.string(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db
      .query('photoCache')
      .withIndex('by_google_maps_uri_and_size', (q) =>
        q.eq('googleMapsUri', args.googleMapsUri).eq('maxWidthPx', args.maxWidthPx)
      )
      .first();

    if (photo) {
      await ctx.db.patch(photo._id, {
        requestCount: (photo.requestCount || 0) + 1,
      });
    }
  },
});
