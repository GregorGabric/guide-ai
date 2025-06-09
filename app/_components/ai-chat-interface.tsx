'use client';
import { useChat } from '@ai-sdk/react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { UIMessage } from 'ai';
import { useAction } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';

interface AiChatProps {
  attraction?: {
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
  } | null;
}

const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, '.site');

export function AiChat({ attraction: _attraction }: AiChatProps) {
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const prevMessageCountRef = useRef(0);
  const prevStatusRef = useRef<string>('ready');
  const convertTextToSpeech = useAction(api.textToSpeech.convertTextToSpeech);
  const audioSource = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
  const player = useAudioPlayer(audioSource);

  const { messages, status, append } = useChat({
    api: `${convexSiteUrl}/api/chat`,
    streamProtocol: 'text',
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

  // Auto-scroll to bottom when messages change, but only while streaming and if user isn't scrolling
  useEffect(() => {
    const currentMessageCount = messages.length;
    const currentStatus = status;
    const wasStreaming = prevStatusRef.current === 'streaming';
    const isNowReady = currentStatus === 'ready';

    // Scroll to bottom in these cases:
    // 1. New messages are added and user isn't scrolling
    // 2. But NOT if AI just finished streaming (to respect user's scroll position)
    const shouldScroll =
      currentMessageCount > prevMessageCountRef.current &&
      !isUserScrolling &&
      scrollViewRef.current &&
      !(wasStreaming && isNowReady); // Don't scroll when AI just finished

    if (shouldScroll) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      prevStatusRef.current = currentStatus;
      prevMessageCountRef.current = currentMessageCount;

      return () => {
        clearTimeout(timeout);
      };
    }

    prevStatusRef.current = currentStatus;
    prevMessageCountRef.current = currentMessageCount;
  }, [isUserScrolling, messages.length, status]);

  // Continuous scrolling while streaming
  useEffect(() => {
    if (status === 'streaming' && !isUserScrolling && scrollViewRef.current) {
      const interval = setInterval(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500); // Scroll every 500ms while streaming

      return () => {
        clearInterval(interval);
      };
    }
  }, [status, isUserScrolling]);

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

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEndDrag = () => {
    // Add a small delay before allowing auto-scroll again
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  return (
    <View className="flex-1" collapsable={false}>
      {/* Messages area - scrollable */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}>
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isPlayingAudio={isPlayingAudio}
            toggleAudio={toggleAudio}
          />
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
      <AiChatInput isLoading={isLoading} append={append} />
    </View>
  );
}

interface MessageProps {
  message: UIMessage;
  isPlayingAudio: boolean;
  toggleAudio: () => void;
}

function Message(props: MessageProps) {
  return (
    <View className={`mb-4 ${props.message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          props.message.role === 'user' ? 'bg-blue-500' : 'border border-slate-200 bg-slate-100'
        }`}>
        <P className={props.message.role === 'user' ? 'text-white' : 'text-slate-800'}>
          {props.message.content}
        </P>
        {props.message.role === 'assistant' && (
          <Button variant="plain" size="sm" className="mt-2 self-start" onPress={props.toggleAudio}>
            {props.isPlayingAudio ? (
              <VolumeX size={16} color="#6B7280" />
            ) : (
              <Volume2 size={16} color="#6B7280" />
            )}
            <P className="text-xs text-slate-600">{props.isPlayingAudio ? 'Stop' : 'Listen'}</P>
          </Button>
        )}
      </View>
    </View>
  );
}

interface AiChatInputProps {
  isLoading: boolean;
  append: ReturnType<typeof useChat>['append'];
}

function AiChatInput({ isLoading, append }: AiChatInputProps) {
  const [text, setText] = useState('');
  return (
    <View className="mb-4 border-t border-slate-200 px-6 py-3">
      <BottomSheetTextInput
        className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
        placeholder="Ask about this location..."
        editable={!isLoading}
        value={text}
        onChangeText={setText}
        onSubmitEditing={(event) => {
          const text = event.nativeEvent.text;
          if (text.trim()) {
            void append({ role: 'user', content: text });
          }
          setText('');
        }}
      />
    </View>
  );
}
