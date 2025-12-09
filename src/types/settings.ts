/**
 * User Settings & Preferences
 *
 * This file defines all user-configurable settings that persist across sessions.
 * Settings are stored in localStorage with a well-organized key structure.
 */

// Volume settings
export interface VolumeSettings {
  // Master volume (0-1)
  master: number;

  // Track volumes (0-1) - applied as multipliers in audio playback
  tracks: {
    chords: number;
    melody: number;
    drums: number;
  };

  // Individual drum sounds (0-1) - applied as multipliers per drum type
  drumSounds: {
    kick: number;
    snare: number;
    hihat: number;
  };
}

// UI/Layout settings
export interface UISettings {
  // Learn mode tablet piano configuration
  learnTabletPiano: {
    height: number;     // Height of tablet piano panel (200-500px)
  };

  // Piano/keyboard display settings
  piano: {
    showInScaleColors: boolean;     // Highlight scale notes on piano
    keyboardPreviewEnabled: boolean; // Show chord notes on keyboard when chord is selected
    showMiniPreview: boolean;        // Show mini piano preview on chord cards
  };
}

// All user settings
export interface UserSettings {
  volume: VolumeSettings;
  ui: UISettings;
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  volume: {
    master: 0.5,  // ~unity gain with new exponential curve
    tracks: {
      chords: 0.75,
      melody: 0.8,
      drums: 0.6,
    },
    drumSounds: {
      kick: 0.8,
      snare: 0.7,
      hihat: 0.6,
    },
  },
  ui: {
    learnTabletPiano: {
      height: 280,
    },
    piano: {
      showInScaleColors: true,
      keyboardPreviewEnabled: true,
      showMiniPreview: true,
    },
  },
};

// localStorage key structure
export const STORAGE_KEYS = {
  SETTINGS: 'enso-piano:settings',
  SONGS: 'enso-piano:songs',
  ACTIVE_SONG_ID: 'enso-piano:active-song-id',
} as const;
