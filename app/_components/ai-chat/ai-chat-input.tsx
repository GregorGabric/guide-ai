import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { CreateMessage } from 'ai';
import { useState } from 'react';
import { View } from 'react-native';
import type { Attraction } from '~/app/_components/ai-chat/ai-chat';

interface AiChatInputProps {
  isLoading: boolean;
  setDrivenIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  attraction: Attraction | null;
  onSend: (message: CreateMessage) => void;
}

export function AiChatInput({
  isLoading,
  setDrivenIds: _,
  attraction: _attraction,
  onSend,
}: AiChatInputProps) {
  const [text, setText] = useState('');
  // const sendMessage = useMutation(api.messages.sendMessage);

  return (
    <View className="mb-4 border-t border-slate-200 px-6 py-3">
      <BottomSheetTextInput
        className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
        placeholder="Ask about this location..."
        editable={!isLoading}
        value={text}
        onChangeText={setText}
        onSubmitEditing={(event) => {
          const inputText = event.nativeEvent.text.trim();
          if (inputText) {
            onSend({
              role: 'user',
              content: inputText,
            });
            setText('');
            // startTransition(async () => {
            //   setText('');
            //   const chatId = await sendMessage({
            //     prompt: inputText,
            //     attraction: {
            //       displayName: attraction?.displayName?.text,
            //       formattedAddress: attraction?.formattedAddress,
            //       summary: attraction?.editorialSummary?.text,
            //     },
            //   });
            //   setDrivenIds((prev) => {
            //     prev.add(chatId);
            //     return prev;
            //   });
            // });
          }
        }}
      />
    </View>
  );
}
