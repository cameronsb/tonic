import { useEffect, useState, useRef, useCallback } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useMusic } from '../../hooks/useMusic';
import { useSettings } from '../../hooks/useSettings';
import { OnboardingTooltip } from './OnboardingTooltip';
import { OnboardingSpotlight } from './OnboardingSpotlight';
import { ProgressionTracker } from './ProgressionTracker';
import './OnboardingOverlay.css';

export function OnboardingOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    playedChords,
    progressionIndex,
    progressionError,
    progressionComplete,
    progressionSong,
    nextStep,
    skip,
    trackChordPlay,
    startOnboarding,
  } = useOnboarding();

  const { state: musicState, audio } = useMusic();
  const { settings } = useSettings();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showHint, setShowHint] = useState(false);
  const prevKeyRef = useRef(musicState.key);
  const prevModeRef = useRef(musicState.mode);
  const prevSelectedChordRef = useRef(musicState.selectedChords);
  const hasStartedRef = useRef(false);
  const wasCompletedRef = useRef(settings.onboarding.completed);

  // Start onboarding when audio finishes loading
  useEffect(() => {
    if (!audio.loading && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startOnboarding();
    }
  }, [audio.loading, startOnboarding]);

  // Watch for "Replay Tutorial" - when completed goes from true to false
  useEffect(() => {
    if (wasCompletedRef.current && !settings.onboarding.completed) {
      // User clicked replay - start the onboarding
      startOnboarding();
    }
    wasCompletedRef.current = settings.onboarding.completed;
  }, [settings.onboarding.completed, startOnboarding]);

  // Calculate target element position
  useEffect(() => {
    if (!isActive || !currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(currentStep.target!);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isActive, currentStep]);

  // Handle hint delay
  useEffect(() => {
    setShowHint(false);
    if (!currentStep?.hintDelay) return;

    const timer = setTimeout(() => {
      setShowHint(true);
    }, currentStep.hintDelay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Reset chord tracking when entering progression step to fix edge case
  // where chord from step 4 carries over
  useEffect(() => {
    if (currentStep?.id === 'play-progression') {
      prevSelectedChordRef.current = [];
    }
  }, [currentStep?.id]);

  // Listen for key changes (step 2 trigger)
  useEffect(() => {
    if (!isActive || currentStep?.id !== 'key-selection') return;

    if (musicState.key !== prevKeyRef.current || musicState.mode !== prevModeRef.current) {
      nextStep();
    }

    prevKeyRef.current = musicState.key;
    prevModeRef.current = musicState.mode;
  }, [isActive, currentStep?.id, musicState.key, musicState.mode, nextStep]);

  // Listen for chord plays (steps 4 & 5)
  useEffect(() => {
    if (!isActive) return;
    if (currentStep?.id !== 'play-chord' && currentStep?.id !== 'play-progression') return;

    const currentChords = musicState.selectedChords;
    const prevChords = prevSelectedChordRef.current;

    // Check if a new chord was selected
    if (currentChords.length > 0 && currentChords !== prevChords) {
      const numeral = currentChords[0]?.numeral;
      if (numeral) {
        if (currentStep.id === 'play-chord') {
          nextStep();
        } else if (currentStep.id === 'play-progression') {
          trackChordPlay(numeral);
        }
      }
    }

    prevSelectedChordRef.current = currentChords;
  }, [isActive, currentStep?.id, musicState.selectedChords, nextStep, trackChordPlay]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        skip();
      }
    },
    [isActive, skip]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isActive || !currentStep) return null;

  // Dynamic button text for step 5
  const dynamicButtonText =
    currentStep.id === 'play-progression' && progressionComplete
      ? 'Nice! Continue \u2192'
      : undefined;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <OnboardingSpotlight targetRect={targetRect} />

      <OnboardingTooltip
        step={currentStep}
        targetRect={targetRect}
        currentIndex={currentStepIndex}
        totalSteps={totalSteps}
        showHint={showHint}
        onNext={nextStep}
        onSkip={skip}
        dynamicButtonText={dynamicButtonText}
      >
        {currentStep.id === 'play-progression' && (
          <ProgressionTracker
            playedChords={playedChords}
            progressionIndex={progressionIndex}
            isComplete={progressionComplete}
            hasError={progressionError}
            song={progressionSong}
          />
        )}
      </OnboardingTooltip>
    </div>
  );
}
