import { google } from '@ai-sdk/google';
import {
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator,
} from '@convex-dev/persistent-text-streaming';
import { type CoreMessage, streamText } from 'ai';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { httpAction, mutation, query } from './_generated/server';

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

export const createChat = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const streamId = await persistentTextStreaming.createStream(ctx);
    const chatId = await ctx.db.insert('chats', {
      title: '...',
      prompt: args.prompt,
      stream: streamId,
    });
    return chatId;
  },
});

export const getChatBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId);
  },
});

export const chatHandler = httpAction(async (ctx, request) => {
  try {
    const body = (await request.json()) as { messages: Array<CoreMessage> };
    const { messages } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key') {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = streamText({
      model: google('gemini-2.0-flash-lite'),
      messages,
      system:
        'You are a knowledgeable and friendly tour guide AI assistant. You provide informative, engaging, and helpful information about locations, attractions, and travel-related topics. Keep your responses concise but informative, and always maintain an enthusiastic and welcoming tone.',
      maxTokens: 1000,
    });

    const streamId = await persistentTextStreaming.createStream(ctx);

    // const stream = result.toDataStreamResponse({
    //   headers: {
    //     'Content-Type': 'application/octet-stream',
    //     'Content-Encoding': 'none',
    //   },
    // });

    const response = await persistentTextStreaming.stream(
      ctx,
      request,
      streamId,
      async (_ctx, _request, _streamId, chunkAppender) => {
        for await (const chunk of result.textStream) {
          await chunkAppender(chunk);
        }
      }
    );

    // Set CORS headers appropriately.
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Vary', 'Origin');
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Encoding', 'none');
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
