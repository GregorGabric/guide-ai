import { useMutation, useQuery } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AiChatInput } from '~/app/_components/ai-chat/ai-chat-input';
import { AIMessage, UserMessage } from '~/app/_components/ai-chat/ai-chat-message';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';

export type Attraction = {
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
}

export function AiChat({ attraction }: AiChatProps) {
  const [audioBase64, _setAudioBase64] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [drivenIds, setDrivenIds] = useState<Set<string>>(() => new Set());
  const audioSource = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
  const player = useAudioPlayer(audioSource);

  const userMessages = useQuery(api.messages.listMessages) ?? [];

  const isLoading = false;

  const isPlayingAudio = player.playing;

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

  return (
    <View className="flex-1" collapsable={false}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}>
        {userMessages.length === 0 && (
          <View className="mb-4 items-start">
            <View className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
              <P className="text-slate-600">No messages yet. Start the conversation!</P>
            </View>
          </View>
        )}

        {userMessages.map((message) => (
          <View key={message._id}>
            <UserMessage message={message} />

            <AIMessage
              scrollViewRef={scrollViewRef}
              isUserScrolling={isUserScrolling}
              userMessages={userMessages}
              message={message}
              isPlayingAudio={isPlayingAudio}
              toggleAudio={toggleAudio}
              isDriven={drivenIds.has(message._id)}
              stopStreaming={() => {
                // Could implement stop streaming logic here
              }}
            />
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

      <AiChatInput isLoading={isLoading} setDrivenIds={setDrivenIds} attraction={attraction} />
    </View>
  );
}
