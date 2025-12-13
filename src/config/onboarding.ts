import type { OnboardingStep } from '../types/onboarding';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Tonic',
    body: 'See how chords work together in any key. This 60-second tour shows you the basics.',
    primaryButton: "Let's Go",
    showSkip: true,
    advanceTrigger: 'button',
    tooltipPosition: 'center',
  },
  {
    id: 'key-selection',
    target: '#key-scale-select',
    title: 'Choose a Key',
    body: 'Every song is in a key. Select one to see its chords, or keep the current key.',
    primaryButton: 'Keep Current',
    showSkip: true,
    advanceTrigger: 'key-change',
    tooltipPosition: 'bottom',
    hintDelay: 4000,
    hintText: 'Try selecting a different key, or click below',
  },
  {
    id: 'chord-strip',
    target: '.chord-tabs-horizontal',
    title: 'Your 7 Chords',
    body: 'These are the chords built from the scale. Roman numerals show their role—uppercase means major, lowercase means minor.',
    primaryButton: 'Got it',
    showSkip: true,
    advanceTrigger: 'button',
    tooltipPosition: 'bottom',
  },
  {
    id: 'play-chord',
    target: '.chord-tabs-horizontal',
    title: 'Hear the Harmony',
    body: 'Tap any chord to hear it. The piano below lights up to show which notes are playing.',
    primaryButton: null,
    showSkip: true,
    advanceTrigger: 'chord-played',
    tooltipPosition: 'bottom',
    hintDelay: 3000,
    hintText: 'Tap a chord above',
  },
  {
    id: 'play-progression',
    target: '.chord-tabs-horizontal',
    title: 'The Hit Progression',
    body: 'Now play: I \u2192 V \u2192 vi \u2192 IV. This four-chord pattern powers countless pop songs.',
    primaryButton: 'Next',
    showSkip: true,
    advanceTrigger: 'button',
    tooltipPosition: 'bottom',
  },
  {
    id: 'explore',
    target: null,
    title: "You're Ready",
    body: 'Try borrowed chords for unexpected colors. Add 7ths and extensions for richer sounds. Explore!',
    primaryButton: 'Start Exploring',
    showSkip: false,
    advanceTrigger: 'button',
    tooltipPosition: 'center',
  },
];

export const PROGRESSION_TARGET_CHORDS = ['I', 'V', 'vi', 'IV'] as const;

export const PROGRESSION_SONG = {
  lyric: 'Just a small town girl...',
  song: "Don't Stop Believin'",
  artist: 'Journey',
} as const;
