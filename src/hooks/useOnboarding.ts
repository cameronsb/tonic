import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSettings } from './useSettings';
import {
  ONBOARDING_STEPS,
  PROGRESSION_TARGET_CHORDS,
  PROGRESSION_SONG,
} from '../config/onboarding';
import type { OnboardingState } from '../types/onboarding';

export function useOnboarding() {
  const { settings, completeOnboarding, skipOnboarding } = useSettings();

  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isActive: false,
    currentStepIndex: 0,
    playedChords: new Set(),
    progressionIndex: 0,
    progressionError: false,
  });

  const currentStep = ONBOARDING_STEPS[onboardingState.currentStepIndex];
  const isLastStep = onboardingState.currentStepIndex === ONBOARDING_STEPS.length - 1;

  const startOnboarding = useCallback(() => {
    if (settings.onboarding.completed) return;
    setOnboardingState({
      isActive: true,
      currentStepIndex: 0,
      playedChords: new Set(),
      progressionIndex: 0,
      progressionError: false,
    });
  }, [settings.onboarding.completed]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      completeOnboarding();
      setOnboardingState((prev) => ({ ...prev, isActive: false }));
    } else {
      setOnboardingState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        playedChords: new Set(),
        progressionIndex: 0,
        progressionError: false,
      }));
    }
  }, [isLastStep, completeOnboarding]);

  const skip = useCallback(() => {
    skipOnboarding();
    setOnboardingState((prev) => ({ ...prev, isActive: false }));
  }, [skipOnboarding]);

  const trackChordPlay = useCallback(
    (numeral: string) => {
      if (currentStep?.id !== 'play-progression') return;

      const normalizedNumeral = numeral.replace(/[0-9]/g, '');
      const expectedChord = PROGRESSION_TARGET_CHORDS[onboardingState.progressionIndex];

      if (normalizedNumeral === expectedChord) {
        setOnboardingState((prev) => ({
          ...prev,
          playedChords: new Set([...prev.playedChords, normalizedNumeral]),
          progressionIndex: prev.progressionIndex + 1,
          progressionError: false,
        }));
      } else {
        // Any wrong chord resets progress
        setOnboardingState((prev) => ({
          ...prev,
          progressionError: true,
        }));
      }
    },
    [currentStep?.id, onboardingState.progressionIndex]
  );

  // Clear error state after animation
  useEffect(() => {
    if (!onboardingState.progressionError) return;

    const timer = setTimeout(() => {
      setOnboardingState((prev) => ({
        ...prev,
        playedChords: new Set(),
        progressionIndex: 0,
        progressionError: false,
      }));
    }, 600);

    return () => clearTimeout(timer);
  }, [onboardingState.progressionError]);

  const progressionComplete = useMemo(
    () => onboardingState.progressionIndex === PROGRESSION_TARGET_CHORDS.length,
    [onboardingState.progressionIndex]
  );

  return {
    isActive: onboardingState.isActive,
    currentStep,
    currentStepIndex: onboardingState.currentStepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    playedChords: onboardingState.playedChords,
    progressionIndex: onboardingState.progressionIndex,
    progressionError: onboardingState.progressionError,
    progressionComplete,
    progressionSong: PROGRESSION_SONG,
    startOnboarding,
    nextStep,
    skip,
    trackChordPlay,
  };
}
