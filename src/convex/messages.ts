import type { StreamId } from '@convex-dev/persistent-text-streaming';
import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';
import { streamingComponent } from './streaming';

export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('userMessages').collect();
  },
});

export const listMessagesByLocationId = query({
  args: {
    locationId: v.string(),
  },
  handler: async (ctx, args) =>
    await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('locationId'), args.locationId))
      .collect(),
});

export const sendMessage = mutation({
  args: {
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', {
      role: args.role,
      content: args.content,
      locationId: args.locationId,
    });
  },
});

export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query('messages').collect();
    await Promise.all(chats.map((chat) => ctx.db.delete(chat._id)));
  },
});

// export const sendMessage = mutation({
//   args: {
//     prompt: v.string(),
//     attraction: v.optional(attractionSchema),
//   },
//   handler: async (ctx, args) => {
//     const responseStreamId = await streamingComponent.createStream(ctx);
//     console.log({ responseStreamId });
//     const chatId = await ctx.db.insert('userMessages', {
//       attraction: args.attraction,
//       prompt: args.prompt,
//       responseStreamId,
//     });
//     return chatId;
//   },
// });

export const getHistory = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allMessages = await ctx.db.query('userMessages').collect();

    // Lets join the user messages with the assistant messages
    const joinedResponses = await Promise.all(
      allMessages.map(async (userMessage) => {
        return {
          userMessage,
          responseMessage: await streamingComponent.getStreamBody(
            ctx,
            userMessage.responseStreamId as StreamId
          ),
        };
      })
    );

    return joinedResponses.flatMap((joined) => {
      const user = {
        role: 'user' as const,
        content: joined.userMessage.prompt,
        attraction: joined.userMessage.attraction,
      };

      const assistant = {
        role: 'assistant' as const,
        content: joined.responseMessage.text,
        attraction: joined.userMessage.attraction,
      };

      // If the assistant message is empty, its probably because we have not
      // started streaming yet so lets not include it in the history
      if (!assistant.content) {
        return [user];
      }

      return [user, assistant];
    });
  },
});

export const getUserMessageByStreamId = internalQuery({
  args: {
    streamId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userMessages')
      .filter((q) => q.eq('responseStreamId', args.streamId))
      .first();
  },
});
