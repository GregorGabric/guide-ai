import { google } from '@ai-sdk/google';
import { type CoreMessage, streamText } from 'ai';
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';

const http = httpRouter();

http.route({
  path: '/api/chat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
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
  }),
});

export default http;
