// VB7D8zswiztJjyl8LI3a - Croatian
// j9RedbMRSNQ74PyikQwD - French
// Dt2jDzhoZC0pZw5bmy2S - German
// NFG5qt843uXKj4pFvR7C - English
// W71zT1VwIFFx3mMGH2uZ - Italian

export const VOICE_CONFIG = {
  croatian: {
    name: 'Croatian',
    voiceId: 'VB7D8zswiztJjyl8LI3a',
    languageCode: 'hr-HR',
    speed: 1.0,
    pitch: 1.0,
  },
  french: {
    name: 'French',
    voiceId: 'j9RedbMRSNQ74PyikQwD',
    languageCode: 'fr-FR',
    speed: 1.0,
    pitch: 1.0,
  },
  german: {
    name: 'German',
    voiceId: 'Dt2jDzhoZC0pZw5bmy2S',
    languageCode: 'de-DE',
    speed: 1.0,
    pitch: 1.0,
  },
  english: {
    name: 'English',
    voiceId: 'NFG5qt843uXKj4pFvR7C',
    languageCode: 'en-US',
    speed: 1.0,
    pitch: 1.0,
  },
  italian: {
    name: 'Italian',
    voiceId: 'W71zT1VwIFFx3mMGH2uZ',
    languageCode: 'it-IT',
    speed: 1.0,
    pitch: 1.0,
  },
} as const;

export type VoiceLanguageName = keyof typeof VOICE_CONFIG;
export type VoiceLanguage = (typeof VOICE_CONFIG)[VoiceLanguageName];
export type VoiceId = (typeof VOICE_CONFIG)[keyof typeof VOICE_CONFIG]['voiceId'];
