import type { StreamId } from '@convex-dev/persistent-text-streaming';
import { useStream } from '@convex-dev/persistent-text-streaming/react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import type { ScrollView } from 'react-native';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';
import type { Doc } from '~/convex/_generated/dataModel';
import { useSmoothText } from '~/lib/hooks';
import { getConvexSiteUrl } from '~/lib/utils';

export function UserMessage({ message }: { message: Doc<'userMessages'> }) {
  return (
    <View className="mb-4 items-end">
      <View className="max-w-[80%] rounded-2xl bg-blue-500 px-4 py-3">
        <P>{message.prompt}</P>
      </View>
    </View>
  );
}

interface MessageProps {
  message: Doc<'userMessages'>;
  isPlayingAudio: boolean;
  toggleAudio: () => void;
  stopStreaming: () => void;
  isDriven: boolean;
  userMessages: Array<Doc<'userMessages'>>;
  isUserScrolling: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export function AIMessage(props: MessageProps) {
  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${getConvexSiteUrl()}/chat-stream`),
    props.isDriven,
    props.message.responseStreamId as StreamId
  );

  const [visibleText] = useSmoothText(text);

  const isCurrentlyStreaming = useMemo(() => {
    if (!props.isDriven) {
      return false;
    }
    return status === 'pending' || status === 'streaming';
  }, [props.isDriven, status]);

  useEffect(() => {
    if (!props.isDriven) {
      return;
    }
    if (isCurrentlyStreaming) {
      return;
    }
    props.stopStreaming();
  }, [props.isDriven, isCurrentlyStreaming, props.stopStreaming, props]);

  if (!visibleText) {
    return null;
  }

  return (
    <View className="mb-4 items-start">
      <View className="max-w-[80%] rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
        <P className="text-slate-800">{visibleText}</P>
        <Button variant="plain" size="sm" className="mt-2 self-start" onPress={props.toggleAudio}>
          {props.isPlayingAudio ? (
            <VolumeX size={16} color="#6B7280" />
          ) : (
            <Volume2 size={16} color="#6B7280" />
          )}
          <P className="text-xs text-slate-600">{props.isPlayingAudio ? 'Stop' : 'Listen'}</P>
        </Button>
      </View>
    </View>
  );
}
