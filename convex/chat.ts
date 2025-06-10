import { google } from '@ai-sdk/google';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import type { Message } from 'ai';
import { streamText } from 'ai';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { httpAction, mutation } from './_generated/server';
import { streamingComponent } from './streaming';

export const createChat = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const streamId = await streamingComponent.createStream(ctx);
    const chatId = await ctx.db.insert('userMessages', {
      prompt: args.prompt,
      responseStreamId: streamId,
    });
    return chatId;
  },
});

export const chatStreamHandler = httpAction(async (ctx, request) => {
  try {
    const body = (await request.json()) as {
      streamId: string;
    };
    const { streamId } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key') {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await streamingComponent.stream(
      ctx,
      request,
      streamId as StreamId,
      async (_ctx, _request, _streamId, append) => {
        const history = await ctx.runQuery(internal.messages.getHistory);

        let locationContext: string | null = null;
        const location = history[0].attraction;

        if (location) {
          locationContext = `
Current Location Context:
- Name: ${location.displayName || 'Unknown'}
- Address: ${location.formattedAddress || 'Address not available'}
- Description: ${location.summary || 'No description available'}

Please provide information specifically about this location and answer questions in the context of this place.
            `;
        }

        const systemPrompt = locationContext
          ? `You are a knowledgeable and friendly tour guide AI assistant focused on helping visitors understand and explore specific locations. ${locationContext} You provide informative, engaging, and helpful information about this location, nearby attractions, and travel-related topics. Keep your responses concise but informative, and always maintain an enthusiastic and welcoming tone. Focus your responses on the current location context provided above.`
          : 'You are a knowledgeable and friendly tour guide AI assistant. You provide informative, engaging, and helpful information about locations, attractions, and travel-related topics. Keep your responses concise but informative, and always maintain an enthusiastic and welcoming tone.';

        const result = streamText({
          model: google('gemini-2.0-flash-lite'),
          messages: history,
          system: systemPrompt,
          maxTokens: 1000,
          onError: ({ error }) => {
            console.error('Streaming error:', error);
          },
        });
        for await (const chunk of result.textStream) {
          await append(chunk);
        }
      }
    );

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Vary', 'Origin');
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

type Attraction = {
  id: string;
  name?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  editorialSummary?: {
    languageCode?: string;
    text?: string;
  };
};

export const chatHandler = httpAction(async (_ctx, request) => {
  try {
    const body = (await request.json()) as {
      messages: Array<Message>;
      attraction: Attraction | null;
    };

    const { messages, attraction } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key') {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // const history = await ctx.runQuery(internal.messages.getHistory);

    let locationContext: string | null = null;
    // const location = history[0].attraction;

    if (attraction) {
      locationContext = `
Current Location Context:
- Name: ${attraction.displayName?.text ?? 'Unknown'}
- Address: ${attraction.formattedAddress ?? 'Address not available'}
- Description: ${attraction.editorialSummary?.text ?? 'No description available'}

Please provide information specifically about this location and answer questions in the context of this place.
            `;
    }

    const systemPrompt = locationContext
      ? `You are a knowledgeable and friendly tour guide AI assistant focused on helping visitors understand and explore specific locations. ${locationContext} You provide informative, engaging, and helpful information about this location, nearby attractions, and travel-related topics. Keep your responses concise but informative, and always maintain an enthusiastic and welcoming tone. Focus your responses on the current location context provided above.`
      : 'You are a knowledgeable and friendly tour guide AI assistant. You provide informative, engaging, and helpful information about locations, attractions, and travel-related topics. Keep your responses concise but informative, and always maintain an enthusiastic and welcoming tone.';

    const result = streamText({
      model: google('gemini-2.0-flash-lite'),
      messages,
      system: systemPrompt,
      onError: ({ error }) => {
        console.error('Streaming error:', error);
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });
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
