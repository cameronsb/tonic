import { useLocalStorage } from './useLocalStorage';
import type { UserSettings } from '../types/settings';
import { DEFAULT_SETTINGS, STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../types/settings';
import { useEffect } from 'react';

function migrateLegacyStorage(): UserSettings | null {
  try {
    const legacySettings = window.localStorage.getItem(LEGACY_STORAGE_KEYS.SETTINGS);

    if (legacySettings) {
      const parsed = JSON.parse(legacySettings);

      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.SETTINGS);
      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.SONGS);
      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.ACTIVE_SONG_ID);

      const migrated: Partial<UserSettings> = {
        volume: {
          master: parsed.volume?.master ?? DEFAULT_SETTINGS.volume.master,
          chords: parsed.volume?.tracks?.chords ?? DEFAULT_SETTINGS.volume.chords,
        },
        ui: parsed.ui,
      };

      return migrated as UserSettings;
    }
  } catch (error) {
    console.error('Error migrating legacy storage:', error);
  }

  return null;
}

function mergeWithDefaults(stored: Partial<UserSettings>): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    volume: {
      ...DEFAULT_SETTINGS.volume,
      ...(stored.volume || {}),
    },
    ui: {
      ...DEFAULT_SETTINGS.ui,
      ...(stored.ui || {}),
      learnTabletPiano: {
        ...DEFAULT_SETTINGS.ui.learnTabletPiano,
        ...(stored.ui?.learnTabletPiano || {}),
      },
      piano: {
        ...DEFAULT_SETTINGS.ui.piano,
        ...(stored.ui?.piano || {}),
      },
      chordStrip: {
        ...DEFAULT_SETTINGS.ui.chordStrip,
        ...(stored.ui?.chordStrip || {}),
      },
      scale: {
        ...DEFAULT_SETTINGS.ui.scale,
        ...(stored.ui?.scale || {}),
      },
    },
    onboarding: {
      ...DEFAULT_SETTINGS.onboarding,
      ...(stored.onboarding || {}),
    },
  };
}

export function useSettings() {
  const legacySettings = migrateLegacyStorage();

  const [storedSettings, setStoredSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEYS.SETTINGS,
    legacySettings || DEFAULT_SETTINGS
  );

  const settings = mergeWithDefaults(storedSettings as Partial<UserSettings>);

  useEffect(() => {
    if (JSON.stringify(storedSettings) !== JSON.stringify(settings)) {
      setStoredSettings(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSettings = (value: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setStoredSettings(value);
  };

  const setMasterVolume = (volume: number) => {
    setSettings((prev) => ({
      ...prev,
      volume: {
        ...prev.volume,
        master: Math.max(0, Math.min(1, volume)),
      },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const setShowInScaleColors = (show: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        piano: {
          ...prev.ui.piano,
          showInScaleColors: show,
        },
      },
    }));
  };

  const setKeyboardPreviewEnabled = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        piano: {
          ...prev.ui.piano,
          keyboardPreviewEnabled: enabled,
        },
      },
    }));
  };

  const setLearnTabletPianoHeight = (height: number) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        learnTabletPiano: {
          ...prev.ui.learnTabletPiano,
          height: Math.max(200, Math.min(500, height)),
        },
      },
    }));
  };

  const setShowMiniPreview = (show: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        piano: {
          ...prev.ui.piano,
          showMiniPreview: show,
        },
      },
    }));
  };

  const setShowBorrowed = (show: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        chordStrip: {
          ...prev.ui.chordStrip,
          showBorrowed: show,
        },
      },
    }));
  };

  const setScaleViewEnabled = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        scale: {
          ...prev.ui.scale,
          viewEnabled: enabled,
        },
      },
    }));
  };

  const completeOnboarding = () => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    }));
  };

  const skipOnboarding = () => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        completed: true,
        skippedAt: new Date().toISOString(),
      },
    }));
  };

  const resetOnboarding = () => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        completed: false,
        completedAt: null,
        skippedAt: null,
      },
    }));
  };

  return {
    settings,
    setSettings,
    setMasterVolume,
    resetSettings,
    setShowInScaleColors,
    setKeyboardPreviewEnabled,
    setLearnTabletPianoHeight,
    setShowMiniPreview,
    setShowBorrowed,
    setScaleViewEnabled,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
