import { IconVolume2 } from '@tabler/icons-react-native';
import type { Message } from 'ai';
import type { AudioPlayer } from 'expo-audio';
import { useAudioPlayerStatus } from 'expo-audio';
import type { ScrollView } from 'react-native';
import { View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
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
        <Text variant={'body'} className="text-primary-foreground">
          {message.content}
        </Text>
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
      <View className="max-w-[80%] rounded-2xl border border-border bg-card px-4 py-3">
        <Text variant={'body'}>{visibleText}</Text>
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
            <LoaderIcon className="animate-spin" color={colors.foreground} />
          ) : isPlaying ? (
            <IconVolume2 size={16} color={colors.foreground} />
          ) : (
            <IconVolume2 size={16} color={colors.foreground} />
          )}

          <Text>{props.isGeneratingAudio ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}</Text>
        </Button>
      </View>
    </View>
  );
}
