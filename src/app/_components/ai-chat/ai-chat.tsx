import { useChat } from '@ai-sdk/react';
import { useMutation } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AiChatInput } from '~/src/app/_components/ai-chat/ai-chat-input';
import { AIMessage, UserMessage } from '~/src/app/_components/ai-chat/ai-chat-message';
import { Button } from '~/src/components/ui/button';
import { P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import type { Doc } from '~/src/convex/_generated/dataModel';
import { getConvexSiteUrl } from '~/src/lib/utils';

export type Attraction = {
  id: string;
  name?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  editorialSummary?: {
    languageCode?: string;
    text?: string;
  };
};

interface AiChatProps {
  attraction: Attraction | null;
  userMessages: Array<Doc<'messages'>>;
}

export function AiChat({ attraction, userMessages }: AiChatProps) {
  const [audioBase64, _setAudioBase64] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [drivenIds, setDrivenIds] = useState<Set<string>>(() => new Set());
  const audioSource = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
  const player = useAudioPlayer(audioSource);
  const isPlayingAudio = player.playing;

  const attractionId = attraction?.id ?? '';

  const { messages, error, append, status } = useChat({
    api: `${getConvexSiteUrl()}/chat`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    body: {
      attraction,
    },
    initialMessages: userMessages.map((message) => ({
      role: message.role,
      content: message.content,
      id: message._id.toString(),
    })),
    onFinish(message) {
      void sendMessage({
        role: message.role as 'user' | 'assistant',
        content: message.content,
        locationId: attractionId,
      });
    },
  });

  const sendMessage = useMutation(api.messages.sendMessage);

  const isLoading = status === 'streaming';

  // Auto-generate initial AI response when component loads with no messages
  useEffect(() => {
    if (userMessages.length === 0 && attraction && messages.length === 0) {
      // This will trigger the AI to generate a response automatically
      void append({
        role: 'user',
        content: `Tell me about ${attraction.displayName?.text || attraction.name || 'this place'}`,
      });
    }
  }, [attraction, userMessages.length, messages.length, append]);

  const toggleAudio = () => {
    if (player.playing) {
      player.pause();
    } else if (audioBase64) {
      player.play();
    }
  };

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    if (scrollViewRef.current && userMessages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [userMessages.length]);

  const clearMessages = useMutation(api.messages.clearMessages);

  if (error) {
    return <P className="text-red-500">{error.message}</P>;
  }

  return (
    <View className="flex-1" collapsable={false}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}>
        {userMessages.length === 0 && !attraction && (
          <View className="mb-4 items-start">
            <View className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
              <P className="text-slate-600">
                No location selected. Please select a location to start the conversation!
              </P>
            </View>
          </View>
        )}

        {messages.map((message) => (
          <View key={message.id}>
            {message.role === 'user' && <UserMessage message={message} />}

            {message.role === 'assistant' && (
              <AIMessage
                scrollViewRef={scrollViewRef}
                isUserScrolling={isUserScrolling}
                message={message}
                isPlayingAudio={isPlayingAudio}
                toggleAudio={toggleAudio}
                isDriven={drivenIds.has(message.id)}
                stopStreaming={() => {
                  // Could implement stop streaming logic here
                }}
              />
            )}
          </View>
        ))}
        <Button
          variant="plain"
          size="sm"
          onPress={() => {
            void clearMessages();
          }}>
          <P>Clear</P>
        </Button>
      </ScrollView>

      <AiChatInput
        isLoading={isLoading}
        setDrivenIds={setDrivenIds}
        attraction={attraction}
        onSend={(message) => {
          void sendMessage({
            role: message.role as 'user' | 'assistant',
            content: message.content,
            locationId: attractionId,
          });
          void append({
            role: message.role,
            content: message.content,
          });
        }}
      />
    </View>
  );
}
