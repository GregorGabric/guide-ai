'use dom';

import { useConversation } from '@elevenlabs/react';
import { Volume2 } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.log(error);
    console.error('Microphone permission denied');
    return false;
  }
}

export default function AiChat() {
  const conversation = useConversation({
    agentId: process.env.EXPO_PUBLIC_AGENT_ID!,
    preferHeadphonesForIosDevices: true,
    agent: {
      prompt: {
        prompt: 'You are a helpful assistant that can answer questions about the Berlin Wall.',
      },
      firstMessage: 'The Berlin Wall was a concrete barrier built in 1961 by East Germany',
      language: 'en',
    },
    onConnect: () => {
      console.log('Connected');
    },
    onDisconnect: () => {
      console.log('Disconnected');
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('No permission');
        return;
      }
      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.EXPO_PUBLIC_AGENT_ID!,
        authorization: process.env.ELEVEN_LABS_API_KEY!,
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  useEffect(() => {
    void startConversation();
  }, [startConversation]);

  return (
    <Button variant="primary" size="lg" onPress={startConversation}>
      <Volume2 size={22} />
      <P>Listen to Audio Guide</P>
    </Button>
  );
}
