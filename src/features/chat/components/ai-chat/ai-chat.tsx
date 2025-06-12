import { useChat } from '@ai-sdk/react';
import type { LegendListRef, LegendListRenderItemProps } from '@legendapp/list';
import { LegendList } from '@legendapp/list';
import { useMutation as useTanstackMutation } from '@tanstack/react-query';
import { useAction, useMutation } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import type { Doc } from '~/src/convex/_generated/dataModel';
import { AiChatInput } from '~/src/features/chat/components/ai-chat/ai-chat-input';
import { AIMessage, UserMessage } from '~/src/features/chat/components/ai-chat/ai-chat-message';
import { AudioLinesIcon } from '~/src/lib/icons/audio-lines';
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

// Define message item type for LegendList
type MessageItem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'message' | 'placeholder' | 'clear-button';
};

export function AiChat({ attraction, userMessages }: AiChatProps) {
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const listRef = useRef<LegendListRef>(null);
  const [drivenIds, setDrivenIds] = useState<Set<string>>(() => new Set());
  const scrollViewRef = useRef<ScrollView | null>(null);
  const player = useAudioPlayer();

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

  useEffect(() => {
    return () => {
      try {
        if (player.isLoaded) {
          player.remove();
        }
      } catch (error) {
        console.warn('Failed to remove audio during cleanup:', error);
      }
    };
  }, [player]);

  const stopAudio = useCallback(() => {
    // Stop audio playback if playing - with safety checks
    try {
      if (player.playing) {
        player.pause();
      }
    } catch (error) {
      console.warn('Failed to pause audio:', error);
    }
  }, [player]);

  const toggleAudio = () => {
    try {
      if (!player.isLoaded) {
        console.warn('Cannot toggle audio: player not loaded');
        return;
      }

      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.warn('Failed to toggle audio:', error);
    }
  };

  const convertTextToSpeech = useAction(api.textToSpeech.convertTextToSpeech);

  const { mutateAsync, isPending } = useTanstackMutation({
    mutationFn: async (text: string) => {
      const audioBase64 = await convertTextToSpeech({ text });
      return audioBase64;
    },
  });

  const playAudio = useCallback(
    async (content: string) => {
      try {
        stopAudio();

        const audioBase64 = await mutateAsync(content);

        const audioSource = `data:audio/mp3;base64,${audioBase64}`;
        try {
          player.replace(audioSource);
          player.play();
        } catch (playError) {
          console.warn('Failed to replace audio source:', playError);
          throw playError;
        }
      } catch (error) {
        console.error('Failed to generate or play audio:', error);
      }
    },
    [mutateAsync, player, stopAudio]
  );

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
    // Stop audio when user starts scrolling (event-driven)
    try {
      if (player.playing) {
        stopAudio();
      }
    } catch (error) {
      console.warn('Failed to stop audio on scroll:', error);
    }
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  const clearMessages = useMutation(api.messages.clearMessages);

  // Get the last AI message for the "Read it" button
  const lastAiMessage = useMemo(() => {
    return messages.filter((msg) => msg.role === 'assistant').pop();
  }, [messages]);

  // Transform messages into data format for LegendList
  const listData = useMemo((): Array<MessageItem> => {
    const items: Array<MessageItem> = [];

    // Add placeholder message if no location selected
    if (userMessages.length === 0 && !attraction) {
      items.push({
        id: 'placeholder',
        role: 'assistant',
        content: 'No location selected. Please select a location to start the conversation!',
        type: 'placeholder',
      });
    }

    // Add all messages
    messages.forEach((message) => {
      items.push({
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: message.content,
        type: 'message',
      });
    });

    // Add clear button as last item
    items.push({
      id: 'clear-button',
      role: 'assistant',
      content: '',
      type: 'clear-button',
    });

    return items;
  }, [messages, userMessages.length, attraction]);

  const renderItem = ({ item }: LegendListRenderItemProps<MessageItem>) => {
    if (item.type === 'placeholder') {
      return (
        <View className="mb-4 items-start px-4">
          <View className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
            <P className="text-slate-600">{item.content}</P>
          </View>
        </View>
      );
    }

    const message = { id: item.id, role: item.role, content: item.content };

    return (
      <View className="px-4">
        {item.role === 'user' && <UserMessage message={message} />}
        {item.role === 'assistant' && (
          <AIMessage
            scrollViewRef={scrollViewRef}
            playAudio={playAudio}
            stopAudio={stopAudio}
            isUserScrolling={isUserScrolling}
            message={message}
            player={player}
            isGeneratingAudio={isPending}
            toggleAudio={toggleAudio}
            isDriven={drivenIds.has(item.id)}
            stopStreaming={() => {
              // Could implement stop streaming logic here
            }}
          />
        )}
      </View>
    );
  };

  if (error) {
    return <P className="text-red-500">{error.message}</P>;
  }

  return (
    <View className="flex-1" collapsable={false}>
      <LegendList
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        maintainScrollAtEnd={true}
        alignItemsAtEnd={true}
        maintainScrollAtEndThreshold={0.1}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />

      <View className="mb-4 gap-2 border-t border-slate-200 px-6 py-3">
        <ScrollView horizontal className="flex-row gap-4">
          <Button
            onPress={() => {
              void clearMessages();
            }}>
            <Text>Clear</Text>
          </Button>
          <Button
            onPress={() => {
              try {
                if (isPending || player.playing) {
                  stopAudio();
                } else if (lastAiMessage) {
                  void playAudio(lastAiMessage.content);
                }
              } catch (error) {
                console.warn('Failed to handle audio button press:', error);
              }
            }}
            disabled={!lastAiMessage}>
            <AudioLinesIcon size={16} />
            <Text>{isPending ? 'Stop' : player.playing ? 'Stop' : 'Read it'}</Text>
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
    </View>
  );
}
