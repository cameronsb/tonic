export interface VolumeSettings {
  master: number;
  chords: number;
}

export interface UISettings {
  learnTabletPiano: {
    height: number;
  };
  piano: {
    showInScaleColors: boolean;
    keyboardPreviewEnabled: boolean;
    showMiniPreview: boolean;
  };
  chordStrip: {
    showBorrowed: boolean;
  };
  scale: {
    viewEnabled: boolean;
  };
}

export interface UserSettings {
  volume: VolumeSettings;
  ui: UISettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  volume: {
    master: 0.5,
    chords: 0.75,
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
    chordStrip: {
      showBorrowed: false,
    },
    scale: {
      viewEnabled: false,
    },
  },
};

export const STORAGE_KEYS = {
  SETTINGS: 'tonic:settings',
} as const;

export const LEGACY_STORAGE_KEYS = {
  SETTINGS: 'theory-tool:settings', // Previous name
  SETTINGS_V1: 'enso-piano:settings', // Original name
  SONGS: 'enso-piano:songs',
  ACTIVE_SONG_ID: 'enso-piano:active-song-id',
} as const;
