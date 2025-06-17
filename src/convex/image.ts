import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { v } from 'convex/values';
import { action } from './_generated/server';

export const analyzeImage = action({
  args: {
    imageBase64: v.string(),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this image and describe what you see. If there are any landmarks, buildings, monuments, artifacts, or other elements with historical significance, please provide detailed information about their historical context, cultural importance, and any relevant historical events or periods they represent.',
            },
            {
              type: 'image',
              image: `data:image/jpeg;base64,${args.imageBase64}`,
            },
          ],
        },
      ],
    });
    return result.text;
  },
});
