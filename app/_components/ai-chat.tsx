'use client';

import { useAction } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { MessageSquare, Volume2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '~/components/ui/button';
import { P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';

const welcomeMessage =
  'The Berlin Wall was a concrete barrier built in 1961 by East Germany to separate East and West Berlin, symbolizing the Cold War division until its fall in 1989.';
export default function AiChat() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const convertTextToSpeech = useAction(api.textToSpeech.convertTextToSpeech);

  // Create audio player with data URI from base64
  const audioSource = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
  const player = useAudioPlayer(audioSource);

  const handlePlayWelcomeMessage = useCallback(async () => {
    try {
      setIsPlaying(true);
      const audioData = await convertTextToSpeech({
        text: welcomeMessage,
      });
      console.log({ audioData }, 'hello');
      setAudioBase64(audioData);
    } catch (error) {
      console.error('Failed to generate audio:', error);
      Alert.alert('Error', 'Failed to generate audio. Please check your internet connection.');
      setIsPlaying(false);
    }
  }, [convertTextToSpeech]);

  // Play audio when base64 is set
  useEffect(() => {
    if (audioBase64) {
      player.play();
    }
  }, [audioBase64, player]);

  // Listen to player events
  useEffect(() => {
    const handlePlaybackStatusUpdate = () => {
      setIsPlaying(player.playing);
    };

    handlePlaybackStatusUpdate();

    const interval = setInterval(handlePlaybackStatusUpdate, 100);

    return () => {
      clearInterval(interval);
    };
  }, [player]);

  const stopAudio = useCallback(() => {
    player.pause();
    setIsPlaying(false);
  }, [player]);

  return (
    <Button
      variant="tonal"
      size="lg"
      className="rounded-2xl border border-slate-200"
      onPress={() => {
        if (isPlaying) {
          stopAudio();
        } else {
          handlePlayWelcomeMessage().catch(console.error);
        }
      }}>
      {isPlaying ? <MessageSquare size={22} /> : <Volume2 size={22} />}
      <P>{isPlaying ? 'Stop Audio Guide' : 'Listen to Audio Guide'}</P>
    </Button>
  );
}
