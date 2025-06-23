import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';

/**
 * Record a new visit to a place
 */
export const recordVisit = mutation({
  args: {
    placeId: v.string(),
    placeName: v.string(),
    placeAddress: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    visitType: v.union(v.literal('automatic'), v.literal('manual')),
    notes: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  returns: v.id('visitedPlaces'),
  handler: async (ctx, args) => {
    // Check if this place was already visited recently (within 1 hour) to avoid duplicates
    const recentVisit = await ctx.db
      .query('visitedPlaces')
      .withIndex('by_place_id', (q) => q.eq('placeId', args.placeId))
      .order('desc')
      .first();

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    if (recentVisit && recentVisit.visitedAt > oneHourAgo) {
      // Return existing visit ID if visited recently
      return recentVisit._id;
    }

    // Record new visit
    const visitId = await ctx.db.insert('visitedPlaces', {
      placeId: args.placeId,
      placeName: args.placeName,
      placeAddress: args.placeAddress,
      latitude: args.latitude,
      longitude: args.longitude,
      visitedAt: Date.now(),
      visitType: args.visitType,
      notes: args.notes,
      country: args.country,
      city: args.city,
    });

    // Update stats
    await ctx.runMutation(internal.visitedPlaces.updateVisitStats);

    return visitId;
  },
});

/**
 * Get all visited places
 */
export const getVisitedPlaces = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('visitedPlaces'),
      _creationTime: v.number(),
      placeId: v.string(),
      placeName: v.string(),
      placeAddress: v.optional(v.string()),
      latitude: v.number(),
      longitude: v.number(),
      visitedAt: v.number(),
      visitType: v.union(v.literal('automatic'), v.literal('manual')),
      notes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      country: v.optional(v.string()),
      city: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query('visitedPlaces').withIndex('by_visited_at').order('desc').collect();
  },
});

/**
 * Get visit statistics
 */
export const getVisitStats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('visitStats').first();
  },
});

/**
 * Internal function to update visit statistics
 */
export const updateVisitStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allVisits = await ctx.db.query('visitedPlaces').collect();

    const uniquePlaceIds = new Set(allVisits.map((visit) => visit.placeId));

    const countries = new Set<string>();
    const cities = new Set<string>();

    allVisits.forEach((visit) => {
      if (visit.country) {
        countries.add(visit.country);
      }
      if (visit.city) {
        cities.add(visit.city);
      }
    });

    const stats = {
      totalVisits: allVisits.length,
      uniquePlaces: uniquePlaceIds.size,
      countriesVisited: Array.from(countries),
      citiesVisited: Array.from(cities),
      lastUpdated: Date.now(),
    };

    const existingStats = await ctx.db.query('visitStats').first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, stats);
    } else {
      await ctx.db.insert('visitStats', stats);
    }
  },
});
