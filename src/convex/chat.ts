import { google } from '@ai-sdk/google';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import type { Message } from 'ai';
import { generateObject, streamText } from 'ai';
import { v } from 'convex/values';
import { z } from 'zod';
import { internal } from './_generated/api';
import { action, httpAction, mutation } from './_generated/server';
import { attractionSchema } from './schema';
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

    let locationContext: string | null = null;

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

const locationHistorySchema = z.object({
  location: z.object({
    name: z.string(),
    address: z.string(),
  }),
  historicalSignificances: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        period: z.string(), // e.g., "Medieval Period", "19th Century", etc.
        significance: z.enum([
          'architectural',
          'cultural',
          'political',
          'religious',
          'economic',
          'social',
          'military',
          'artistic',
          'scientific',
        ]),
        yearRange: z
          .object({
            start: z.number().optional(),
            end: z.number().optional(),
          })
          .optional(),
        keyFigures: z.array(z.string()).optional(),
        relatedEvents: z.array(z.string()).optional(),
        popularityScore: z.number().min(1).max(10), // 1-10 ranking by popularity/importance
      })
    )
    .min(3)
    .max(8), // Get 3-8 most popular historical significances
  summary: z.string(), // Brief overview of the location's historical importance
});

export type LocationHistorySignificance = z.infer<
  typeof locationHistorySchema.shape.historicalSignificances
>[number]['significance'];

export const getLocationHistory = action({
  args: {
    attraction: attractionSchema,
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { attraction } = args;

    const locationName = attraction.displayName || 'Unknown Location';
    const locationAddress = attraction.formattedAddress || '';
    const locationSummary = attraction.summary || '';

    const prompt = `
Analyze the historical significance of the following location and provide the most popular and important historical events, periods, and cultural significance associated with it.

Location Details:
- Name: ${locationName}
- Address: ${locationAddress}
- Description: ${locationSummary}

Please provide:
1. A comprehensive list of the most popular historical significances (3-8 items)
2. Rank them by popularity and historical importance (popularityScore 1-10, where 10 is most significant)
3. Include relevant time periods, key figures, and related events where applicable
4. Focus on factual, well-documented historical information
5. Prioritize the most widely known and significant historical aspects

For each historical significance, provide:
- A clear, engaging title
- A detailed description (2-3 sentences)
- The historical period it relates to
- The type of significance (architectural, cultural, political, etc.)
- Popularity/importance score (1-10)
- Optional: specific year ranges, key figures, related events
`;

    try {
      const result = await generateObject({
        model: google('gemini-2.0-flash-lite'),
        schema: locationHistorySchema,
        prompt,
        maxTokens: 2000,
      });

      return result.object;
    } catch (error) {
      console.error('Error generating location history:', error);
      throw new Error('Failed to generate location history');
    }
  },
});
