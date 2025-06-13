'use node';

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { v } from 'convex/values';
import { action } from './_generated/server';

const apiKey = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey,
});

export const convertTextToSpeech = action({
  args: {
    text: v.string(),
    voiceId: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    try {
      const voiceId = 'EkK5I93UQWFDigLMpZcX';

      const audioStream = await client.textToSpeech.stream(voiceId, {
        text: args.text,
        modelId: 'eleven_flash_v2_5',
        outputFormat: 'mp3_44100_128',
      });

      const chunks: Array<Buffer> = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk as Buffer);
      }
      const content = Buffer.concat(chunks);

      return content.toString('base64');
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Text-to-speech conversion failed: ${errorMessage}`);
    }
  },
});
