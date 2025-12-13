export type OnboardingStepId =
  | 'welcome'
  | 'key-selection'
  | 'chord-strip'
  | 'play-chord'
  | 'play-progression'
  | 'explore';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type AdvanceTrigger = 'button' | 'key-change' | 'chord-played' | 'skip';

export interface OnboardingStep {
  id: OnboardingStepId;
  target: string | null;
  title: string;
  body: string;
  primaryButton: string | null;
  showSkip: boolean;
  advanceTrigger: AdvanceTrigger;
  tooltipPosition: TooltipPosition;
  hintDelay?: number;
  hintText?: string;
}

export interface OnboardingState {
  isActive: boolean;
  currentStepIndex: number;
  playedChords: Set<string>;
  progressionIndex: number;
  progressionError: boolean;
}

export interface OnboardingSettings {
  completed: boolean;
  completedAt: string | null;
  skippedAt: string | null;
}
