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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Start onboarding when audio finishes loading successfully
  useEffect(() => {
    if (!audio.loading && !audio.error && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startOnboarding();
    }
  }, [audio.loading, audio.error, startOnboarding]);

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

  // Move focus to the tooltip heading on every step change so keyboard/SR
  // users don't lose their place when the coach-mark advances.
  useEffect(() => {
    if (!isActive || !currentStep) return;
    headingRef.current?.focus();
  }, [isActive, currentStep]);

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

  // Only steps with no target (fully centered, no background element to
  // interact with) are truly modal. Steps that highlight a background
  // control must stay non-modal so assistive tech doesn't mark the rest
  // of the page as inert while instructing the user to interact with it.
  const isBlocking = currentStep.tooltipPosition === 'center';

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal={isBlocking || undefined}>
      <OnboardingSpotlight targetRect={targetRect} />

      <div className="sr-only" aria-live="polite">
        {currentStep.title}
        {'. '}
        {currentStep.body}
      </div>

      <OnboardingTooltip
        step={currentStep}
        targetRect={targetRect}
        currentIndex={currentStepIndex}
        totalSteps={totalSteps}
        showHint={showHint}
        onNext={nextStep}
        onSkip={skip}
        dynamicButtonText={dynamicButtonText}
        headingRef={headingRef}
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
