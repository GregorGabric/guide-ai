'use client';
import { useChat } from '@ai-sdk/react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useAction } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';

interface AiChatInterfaceProps {
  attraction?: {
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
  } | null;
}

const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, '.site');

export default function AiChatInterface({ attraction: _attraction }: AiChatInterfaceProps) {
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const convertTextToSpeech = useAction(api.textToSpeech.convertTextToSpeech);
  const audioSource = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
  const player = useAudioPlayer(audioSource);

  const { messages, status, append } = useChat({
    api: `${convexSiteUrl}/api/chat`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    initialMessages: [
      {
        id: 'initial',
        role: 'assistant',
        content: "Hello! I'm your AI tour guide. What would you like to know about this location?",
      },
    ],
    onFinish: (message) => {
      // Automatically convert AI responses to speech
      if (message.role === 'assistant') {
        handleTextToSpeech(message.content).catch(console.error);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const isLoading = status === 'streaming';

  const isPlayingAudio = player.playing;

  const handleTextToSpeech = useCallback(
    async (text: string) => {
      try {
        const audioData = await convertTextToSpeech({ text });
        setAudioBase64(audioData);
      } catch (error) {
        console.error('Failed to generate audio:', error);
      }
    },
    [convertTextToSpeech]
  );

  const toggleAudio = () => {
    if (player.playing) {
      player.pause();
    } else if (audioBase64) {
      player.play();
    }
  };

  const mockMessages = [
    {
      id: 'initial',
      role: 'assistant',
      content: "Hello! I'm your AI tour guide. What would you like to know about this location?",
      parts: [
        {
          type: 'text',
          text: "Hello! I'm your AI tour guide. What would you like to know about this location?",
        },
      ],
    },
    {
      role: 'user',
      content: 'Help',
      id: 'G5bDBftXq9WH0piz',
      createdAt: '2025-06-08T20:12:26.777Z',
      parts: [
        {
          type: 'text',
          text: 'Help',
        },
      ],
    },
    {
      id: 'msg-P4WMG0m8Ck0w9jUE71q9TYQI',
      createdAt: '2025-06-08T20:12:27.266Z',
      role: 'assistant',
      content:
        "No problem! I'm here to help. What are you looking for? Are you planning a trip? Do you need information about a specific place? Just let me know how I can assist you!\n",
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: "No problem! I'm here to help. What are you looking for? Are you planning a trip? Do you need information about a specific place? Just let me know how I can assist you!\n",
        },
      ],
      revisionId: 'm1Qu4HH3Vh2tN7qm',
    },
    {
      role: 'user',
      content: 'Help',
      id: 'XvhdXeJWy3WYoj4e',
      createdAt: '2025-06-08T20:12:29.117Z',
      parts: [
        {
          type: 'text',
          text: 'Help',
        },
      ],
    },
    {
      id: 'msg-gH6dZ17YBRTUc4I4l7VGL5VW',
      createdAt: '2025-06-08T20:12:29.619Z',
      role: 'assistant',
      content:
        "Okay! I'm ready to help. To give you the best assistance, could you tell me what you need help with? Are you looking for:\n\n*   **Travel advice?** (e.g., planning a trip, finding flights, booking hotels)\n*   **Information about a specific location?** (e.g., attractions, history, things to do)\n*   **General travel tips?** (e.g., packing, safety, etiquette)\n\nThe more information you give me, the better I can assist you!\n",
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: "Okay! I'm ready to help. To give you the best assistance, could you tell me what you need help with? Are you looking for:\n\n*   **Travel advice?** (e.g., planning a trip, finding flights, booking hotels)\n*   **Information about a specific location?** (e.g., attractions, history, things to do)\n*   **General travel tips?** (e.g., packing, safety, etiquette)\n\nThe more information you give me, the better I can assist you!\n",
        },
      ],
      revisionId: 'r6ceD1zprSXcXrJd',
    },
  ];

  return (
    <View className="flex-1" collapsable={false}>
      {/* Messages area - scrollable */}
      <ScrollView
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}>
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <View
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user' ? 'bg-blue-500' : 'border border-slate-200 bg-slate-100'
              }`}>
              <P className={message.role === 'user' ? 'text-white' : 'text-slate-800'}>
                {message.content}
              </P>
              {message.role === 'assistant' && (
                <Button variant="plain" size="sm" className="mt-2 self-start" onPress={toggleAudio}>
                  {isPlayingAudio ? (
                    <VolumeX size={16} color="#6B7280" />
                  ) : (
                    <Volume2 size={16} color="#6B7280" />
                  )}
                  <P className="text-xs text-slate-600">{isPlayingAudio ? 'Stop' : 'Listen'}</P>
                </Button>
              )}
            </View>
          </View>
        ))}

        {isLoading && (
          <View className="mb-4 items-start">
            <View className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
              <P className="text-slate-600">AI is thinking...</P>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input area - fixed at bottom */}
      <View className="mb-4 border-t border-slate-200 px-6 py-3">
        <BottomSheetTextInput
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
          placeholder="Ask about this location..."
          maxLength={500}
          editable={!isLoading}
          onSubmitEditing={(event) => {
            const text = event.nativeEvent.text;
            if (text.trim()) {
              void append({ role: 'user', content: text });
            }
          }}
        />
      </View>
    </View>
  );
}
