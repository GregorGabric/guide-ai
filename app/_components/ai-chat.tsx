'use client';

import { MessageSquare } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import AiChatInterface from './ai-chat-interface';

interface AiChatProps {
  attraction?: {
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
  } | null;
  onStartChat?: () => void;
}

export default function AiChat({ attraction, onStartChat }: AiChatProps) {
  const [showChat, setShowChat] = useState(false);

  const handleStartChat = () => {
    setShowChat(true);
    onStartChat?.();
  };

  if (showChat) {
    return <AiChatInterface attraction={attraction} />;
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Button
        variant="tonal"
        size="lg"
        className="rounded-2xl border border-slate-200"
        onPress={handleStartChat}>
        <MessageSquare size={22} />
        <P>Start AI Guide</P>
      </Button>
    </View>
  );
}
