import { useChat } from '@ai-sdk/react';
import type { LegendListRef, LegendListRenderItemProps } from '@legendapp/list';
import { LegendList } from '@legendapp/list';
import { useMutation as useTanstackMutation } from '@tanstack/react-query';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';
import { fetch as expoFetch } from 'expo/fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useStore } from 'zustand';
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { api } from '~/src/convex/_generated/api';
import type { Doc } from '~/src/convex/_generated/dataModel';
import { AiChatInput } from '~/src/features/chat/components/ai-chat/ai-chat-input';
import { AIMessage, UserMessage } from '~/src/features/chat/components/ai-chat/ai-chat-message';
import { languageStore } from '~/src/features/settings/store';
import { LoaderIcon } from '~/src/lib/icons/loader-icon';
import { useTheme } from '~/src/lib/theme/theme-provider';
import { getUserId } from '~/src/lib/userId';
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
  const [userId, setUserId] = useState<string | null>(null);
  const voiceId = useStore(languageStore, (state) => state.language.voiceId);

  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;

  const attractionId = attraction?.id ?? '';

  // Initialize user ID
  useEffect(() => {
    getUserId()
      .then(setUserId)
      .catch((error: unknown) => {
        console.error('Failed to get user ID:', error);
      });
  }, []);

  // Get user trial info for UI display
  const userTrialInfo = useQuery(api.ttsRequests.getUserTrialInfo);

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

  // New TTS mutations
  const requestTTS = useMutation(api.ttsRequests.requestTextToSpeech);
  const generateTTS = useAction(api.textToSpeech.generateTTS);
  const updateTTSStatus = useMutation(api.ttsRequests.updateRequestStatus);

  const isLoading = status === 'streaming';

  // Auto-generate initial AI response when component loads with no messages
  useEffect(() => {
    if (userMessages.length === 0 && attraction && messages.length === 0) {
      void append({
        role: 'user',
        content: `Tell me about ${attraction.displayName?.text || attraction.name || 'this place'}`,
      });
    }
  }, [attraction, userMessages.length, messages.length, append]);

  const stopAudio = useCallback(() => {
    try {
      if (isPlaying) {
        player.pause();
      }
    } catch (error) {
      console.warn('Failed to pause audio:', error);
    }
  }, [player, isPlaying]);

  const toggleAudio = useCallback(() => {
    try {
      if (!player.isLoaded) {
        console.warn('Cannot toggle audio: player not loaded');
        return;
      }

      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.warn('Failed to toggle audio:', error);
    }
  }, [player, isPlaying]);

  const db = useSQLiteContext();

  const { mutateAsync, isPending: isGeneratingAudio } = useTanstackMutation({
    mutationFn: async (text: string) => {
      if (!userId) {
        throw new Error('User ID not initialized');
      }

      const textHash = btoa(text).slice(0, 16);
      const cacheKey = `tts_${textHash}`;

      // Check cache first
      const result = await db.getFirstAsync<{ text: string; audio: string }>(
        'SELECT * FROM audio_cache WHERE cache_key = ?',
        [cacheKey]
      );

      if (result) {
        return result.audio;
      }

      try {
        const requestId = await requestTTS({
          text,
        });
        await updateTTSStatus({
          requestId,
          status: 'processing',
        });

        const audioBase64 = await generateTTS({
          text,
          voiceId,
        });

        // Step 4: Update status to completed with audio data
        await updateTTSStatus({
          requestId,
          status: 'completed',
          audioData: audioBase64,
          completedAt: Date.now(),
        });

        // Cache the result
        try {
          await db.runAsync('INSERT INTO audio_cache (cache_key, audio) VALUES (?, ?)', [
            cacheKey,
            audioBase64,
          ]);
        } catch (error) {
          console.warn('Failed to cache audio', error);
        }

        return audioBase64;
      } catch (error) {
        console.error('TTS generation failed:', error);

        // Handle specific error types without showing paywall (as requested)
        if (error instanceof Error) {
          if (error.message === 'TRIAL_LIMIT_EXCEEDED') {
            throw new Error(
              `Trial limit reached! You've used ${userTrialInfo?.trialTtsCount || 0}/${userTrialInfo?.trialTtsLimit || 10} free TTS requests.`
            );
          } else if (error.message === 'RATE_LIMIT_EXCEEDED') {
            throw new Error('Rate limit exceeded. Please wait before making more TTS requests.');
          }
        }

        throw error;
      }
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
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  const clearMessages = useMutation(api.messages.clearMessages);

  const lastAiMessage = useMemo(() => {
    return messages.filter((msg) => msg.role === 'assistant').pop();
  }, [messages]);

  const listData = useMemo((): Array<MessageItem> => {
    const items: Array<MessageItem> = [];

    if (userMessages.length === 0 && !attraction) {
      items.push({
        id: 'placeholder',
        role: 'assistant',
        content: 'No location selected. Please select a location to start the conversation!',
        type: 'placeholder',
      });
    }

    messages.forEach((message) => {
      items.push({
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: message.content,
        type: 'message',
      });
    });

    items.push({
      id: 'clear-button',
      role: 'assistant',
      content: '',
      type: 'clear-button',
    });

    return items;
  }, [messages, userMessages.length, attraction]);

  const { colors } = useTheme();

  const renderItem = useCallback(
    ({ item, index }: LegendListRenderItemProps<MessageItem>) => {
      if (item.type === 'placeholder') {
        return (
          <View className="mb-4 items-start px-4">
            <View className="rounded-2xl border border-border bg-card px-4 py-3">
              <Text variant={'body'}>{item.content}</Text>
            </View>
          </View>
        );
      }

      const message = { id: item.id, role: item.role, content: item.content };

      const nextItem = listData.at(index + 1);
      const isNextUserMessage = nextItem?.role === 'user' && nextItem.type === 'message';

      return (
        <View>
          {item.role === 'user' && (
            <UserMessage message={message} isNextUserMessage={isNextUserMessage} />
          )}
          {item.role === 'assistant' && (
            <AIMessage
              scrollViewRef={scrollViewRef}
              playAudio={playAudio}
              stopAudio={stopAudio}
              isUserScrolling={isUserScrolling}
              message={message}
              player={player}
              isGeneratingAudio={isGeneratingAudio}
              toggleAudio={toggleAudio}
              isDriven={drivenIds.has(item.id)}
              stopStreaming={() => {
                // Could implement stop streaming logic here
              }}
            />
          )}
        </View>
      );
    },
    [
      drivenIds,
      isGeneratingAudio,
      isUserScrolling,
      listData,
      playAudio,
      player,
      stopAudio,
      toggleAudio,
    ]
  );

  if (error) {
    return (
      <Text variant={'body'} className="text-destructive">
        {error.message}
      </Text>
    );
  }

  return (
    <View className="flex-1" collapsable={false}>
      <LegendList
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        estimatedItemSize={200}
        contentContainerClassName="py-4 android:pb-12"
        recycleItems
        ref={listRef}
        data={listData}
        onLoad={() => {
          listRef.current?.scrollToEnd();
        }}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16, paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
        maintainScrollAtEnd
        alignItemsAtEnd
        maintainScrollAtEndThreshold={0.1}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />

      <View className="-mx-8 mb-4 items-stretch gap-2 border-t border-border px-8 py-3">
        <ScrollView horizontal contentContainerClassName="flex-row gap-2">
          <Button
            onPress={() => {
              void clearMessages();
            }}
          >
            <Text>Clear</Text>
          </Button>
          <Button
            onPress={() => {
              try {
                if (isGeneratingAudio || isPlaying) {
                  stopAudio();
                } else if (lastAiMessage) {
                  void playAudio(lastAiMessage.content);
                }
              } catch (error) {
                console.warn('Failed to handle audio button press:', error);
              }
            }}
            disabled={!lastAiMessage}
          >
            {isGeneratingAudio ? (
              <LoaderIcon className="animate-spin" color={colors.background} />
            ) : isPlaying ? (
              <Text>Stop</Text>
            ) : (
              <Text>Read it</Text>
            )}
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
