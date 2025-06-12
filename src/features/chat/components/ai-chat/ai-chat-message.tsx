import type { Message } from 'ai';
import { AudioPlayer } from 'expo-audio';
import { Volume2, VolumeX } from 'lucide-react-native';
import type { ScrollView } from 'react-native';
import { View } from 'react-native';
import { Button } from '~/src/components/ui/button';
import { P } from '~/src/components/ui/typography';
import { useSmoothText } from '~/src/lib/hooks';

export function UserMessage({ message }: { message: Message }) {
  return (
    <View className="mb-4 items-end">
      <View className="max-w-[80%] rounded-2xl bg-blue-500 px-4 py-3">
        <P>{message.content}</P>
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
  // const { text, status } = useStream(
  //   api.streaming.getStreamBody,
  //   new URL(`${getConvexSiteUrl()}/chat-stream`),
  //   props.isDriven,
  //   props.message.id as StreamId
  // );

  const [visibleText] = useSmoothText(props.message.content);

  // const isCurrentlyStreaming = useMemo(() => {
  //   if (!props.isDriven) {
  //     return false;
  //   }
  //   return status === 'pending' || status === 'streaming';
  // }, [props.isDriven, status]);

  // useEffect(() => {
  //   if (!props.isDriven) {
  //     return;
  //   }
  //   if (isCurrentlyStreaming) {
  //     return;
  //   }
  //   props.stopStreaming();
  // }, [props.isDriven, isCurrentlyStreaming, props.stopStreaming, props]);

  if (!visibleText) {
    return null;
  }

  return (
    <View className="mb-4 items-start">
      <View className="max-w-[80%] rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
        <P className="text-slate-800">{visibleText}</P>
        <Button
          variant="plain"
          size="sm"
          className="mt-2 self-start"
          onPress={() => {
            if (props.isGeneratingAudio || props.player.playing) {
              props.stopAudio();
            } else {
              props.playAudio(props.message.content);
            }
          }}>
          {props.player.playing || props.isGeneratingAudio ? (
            <VolumeX size={16} color="#6B7280" />
          ) : (
            <Volume2 size={16} color="#6B7280" />
          )}
          <P className="text-xs text-slate-600">
            {props.isGeneratingAudio ? 'Stop' : props.player.playing ? 'Stop' : 'Listen'}
          </P>
        </Button>
      </View>
    </View>
  );
}
