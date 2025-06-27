import { IconVolume2 } from '@tabler/icons-react-native';
import type { Message } from 'ai';
import type { AudioPlayer } from 'expo-audio';
import { useAudioPlayerStatus } from 'expo-audio';
import type { ScrollView } from 'react-native';
import { View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { P } from '~/src/components/ui/typography';
import { useSmoothText } from '~/src/lib/hooks';
import { LoaderIcon } from '~/src/lib/icons/loader-icon';
import { useTheme } from '~/src/lib/theme/theme-provider';
import { cn } from '~/src/lib/utils';

interface UserMessageProps {
  message: Message;
  isNextUserMessage: boolean;
}

export function UserMessage({ message, isNextUserMessage }: UserMessageProps) {
  return (
    <View className={cn('mb-3 items-end', isNextUserMessage && 'mb-2')}>
      <View
        style={{
          borderCurve: 'continuous',
        }}
        className="max-w-[80%] items-end rounded-2xl bg-primary px-4 py-2"
      >
        <P className="text-primary-foreground">{message.content}</P>
      </View>
    </View>
  );
}

interface MessageProps {
  message: Message;
  player: AudioPlayer;
  isGeneratingAudio: boolean;
  toggleAudio: () => void;
  stopAudio: () => void;
  stopStreaming: () => void;
  isDriven: boolean;
  isUserScrolling: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  playAudio: (content: string) => void;
}

export function AIMessage(props: MessageProps) {
  const [visibleText] = useSmoothText(props.message.content);
  const playerStatus = useAudioPlayerStatus(props.player);
  const isPlaying = playerStatus.playing;
  const { colors } = useTheme();
  if (!visibleText) {
    return null;
  }

  return (
    <View className="mb-4 items-start">
      <View className="max-w-[80%] rounded-2xl border border-border bg-background px-4 py-3">
        <P>{visibleText}</P>
        <Button
          variant="plain"
          size="sm"
          className="mt-2 self-start"
          onPress={() => {
            if (isPlaying) {
              props.player.pause();
            } else {
              props.playAudio(props.message.content);
            }
          }}
        >
          {props.isGeneratingAudio ? (
            <LoaderIcon className="animate-spin" color={colors.card} />
          ) : isPlaying ? (
            <IconVolume2 size={16} color={colors.card} />
          ) : (
            <IconVolume2 size={16} color={colors.card} />
          )}

          <P>{props.isGeneratingAudio ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}</P>
        </Button>
      </View>
    </View>
  );
}
