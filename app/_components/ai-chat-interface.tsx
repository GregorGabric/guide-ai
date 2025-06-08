'use client';
import { useChat } from '@ai-sdk/react';
import { useAction } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
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

  return (
    <View className="flex-1">
      {/* Chat Messages */}
      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
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

      {/* Input Area */}
      <View className="border-t border-slate-200 bg-white px-4 py-3">
        <View className="flex-row items-center space-x-2">
          <TextInput
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3"
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
    </View>
  );
}
