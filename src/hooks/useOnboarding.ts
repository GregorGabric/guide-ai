import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const ONBOARDING_STORAGE_KEY = 'guide-ai-onboarding';
const ONBOARDING_VERSION = '1.0.0'; // Update this when onboarding flow changes

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  onboardingVersion: string;
  lastCompletedAt?: number;
  setOnboardingCompleted: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      onboardingVersion: '',
      lastCompletedAt: undefined,
      setOnboardingCompleted: () => {
        set({
          hasCompletedOnboarding: true,
          onboardingVersion: ONBOARDING_VERSION,
          lastCompletedAt: Date.now(),
        });
      },
      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          onboardingVersion: '',
          lastCompletedAt: undefined,
        });
      },
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export interface UseOnboardingReturn {
  shouldShowOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [isLoading, setIsLoading] = useState(true);
  const { hasCompletedOnboarding, onboardingVersion, setOnboardingCompleted, resetOnboarding } =
    useOnboardingStore();

  // Determine if onboarding should be shown
  const shouldShowOnboarding = !hasCompletedOnboarding || onboardingVersion !== ONBOARDING_VERSION;

  useEffect(() => {
    // Check if we need to migrate onboarding state
    const checkOnboardingMigration = () => {
      try {
        // Check for legacy storage keys or version mismatches
        if (hasCompletedOnboarding && onboardingVersion !== ONBOARDING_VERSION) {
          console.log('Onboarding version mismatch, resetting onboarding');
          // Version mismatch - reset onboarding to show new flow
          resetOnboarding();
        }
      } catch (error) {
        console.error('Error checking onboarding migration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingMigration();
  }, [hasCompletedOnboarding, onboardingVersion, resetOnboarding]);

  const completeOnboarding = () => {
    setOnboardingCompleted();
  };

  return {
    shouldShowOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
