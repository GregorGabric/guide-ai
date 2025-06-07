'use dom';

import { useConversation } from '@elevenlabs/react';
import { Mic } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
    <Pressable
      style={[styles.callButton, conversation.status === 'connected' && styles.callButtonActive]}
      onPress={conversation.status === 'disconnected' ? startConversation : stopConversation}>
      <View
        style={[
          styles.buttonInner,
          conversation.status === 'connected' && styles.buttonInnerActive,
        ]}>
        <Mic size={32} color="#E2E8F0" strokeWidth={1.5} style={styles.buttonIcon} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  callButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonInnerActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
});
