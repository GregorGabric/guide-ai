import { createStore } from 'zustand';
import type { VoiceLanguage } from '~/src/features/chat/voice-config';
import { VOICE_CONFIG } from '~/src/features/chat/voice-config';

type LanguageStore = {
  language: VoiceLanguage;
  setLanguage: (language: VoiceLanguage) => void;
};

export const languageStore = createStore<LanguageStore>((set) => ({
  language: VOICE_CONFIG.english,
  setLanguage: (language) => {
    set({ language });
  },
}));
