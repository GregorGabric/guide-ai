import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Configuration constants
export const TRIAL_TTS_LIMIT = 10; // Free trial limit
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const RATE_LIMIT_MAX_REQUESTS = 20; // Max requests per hour

// Mutation: Create a TTS request and validate user limits
export const requestTextToSpeech = mutation({
  args: {
    text: v.string(),
    voiceId: v.optional(v.string()),
  },
  returns: v.id('ttsRequests'),
  handler: async (ctx, args) => {
    const now = Date.now();

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const user = await ctx.db
      .query('users')
      .withIndex('by_id', (q) => q.eq('_id', userId))
      .first();

    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    // Check trial limits - both count limit AND time limit
    const trialExpired = user.trialExpiresAt && now > user.trialExpiresAt;
    const trialCountExceeded = user.trialTtsCount && user.trialTtsCount >= TRIAL_TTS_LIMIT;

    if (trialExpired || trialCountExceeded) {
      throw new Error('TRIAL_LIMIT_EXCEEDED');
    }

    // Check rate limiting
    const recentRequests = await ctx.db
      .query('ttsRequests')
      .withIndex('by_user_and_created', (q) =>
        q.eq('userId', userId).gte('createdAt', now - RATE_LIMIT_WINDOW_MS)
      )
      .collect();

    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    // Create TTS request record
    const requestId = await ctx.db.insert('ttsRequests', {
      userId: userId,
      text: args.text,
      status: 'pending',
      createdAt: now,
    });

    // Update user trial count
    await ctx.db.patch(user._id, {
      trialTtsCount: (user.trialTtsCount || 0) + 1,
    });

    return requestId;
  },
});

// Mutation: Update request status
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id('ttsRequests'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    audioData: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      status: args.status,
    };

    if (args.audioData !== undefined) {
      updates.audioData = args.audioData;
    }
    if (args.completedAt !== undefined) {
      updates.completedAt = args.completedAt;
    }
    if (args.errorMessage !== undefined) {
      updates.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.requestId, updates);
  },
});

// Query: Get TTS request status
export const getTtsRequest = query({
  args: {
    requestId: v.id('ttsRequests'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

// Query: Get user's TTS requests
export const getUserTtsRequests = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('ttsRequests')
      .withIndex('by_user_and_created', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(args.limit || 50);
  },
});

// Query: Get user trial info
export const getUserTrialInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const user = await ctx.db
      .query('users')
      .withIndex('by_id', (q) => q.eq('_id', userId))
      .first();

    if (!user) {
      return {
        trialTtsCount: 0,
        trialTtsLimit: TRIAL_TTS_LIMIT,
        trialExpiresAt: null,
        trialActive: true,
        canUseTts: true,
      };
    }

    const now = Date.now();
    const trialActive = !user.trialExpiresAt || now <= user.trialExpiresAt;

    return {
      trialTtsCount: user.trialTtsCount,
      trialTtsLimit: TRIAL_TTS_LIMIT,
      trialExpiresAt: user.trialExpiresAt,
      trialActive,
      canUseTts: trialActive && (user.trialTtsCount || 0) < TRIAL_TTS_LIMIT,
    };
  },
});
