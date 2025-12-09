import { useLocalStorage } from './useLocalStorage';
import type { UserSettings } from '../types/settings';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../types/settings';
import { useEffect } from 'react';

/**
 * Deep merge settings with defaults to handle missing fields
 */
function mergeWithDefaults(stored: Partial<UserSettings>): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    volume: {
      ...DEFAULT_SETTINGS.volume,
      ...(stored.volume || {}),
      tracks: {
        ...DEFAULT_SETTINGS.volume.tracks,
        ...(stored.volume?.tracks || {}),
      },
      drumSounds: {
        ...DEFAULT_SETTINGS.volume.drumSounds,
        ...(stored.volume?.drumSounds || {}),
      },
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
    },
  };
}

/**
 * Hook for managing user settings with localStorage persistence
 *
 * Provides type-safe access to all user settings and ensures
 * changes are automatically persisted.
 */
export function useSettings() {
  const [storedSettings, setStoredSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS
  );

  // Merge loaded settings with defaults (migration for new fields)
  const settings = mergeWithDefaults(storedSettings as Partial<UserSettings>);

  // Update stored settings if migration added new fields
  useEffect(() => {
    if (JSON.stringify(storedSettings) !== JSON.stringify(settings)) {
      setStoredSettings(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSettings = (value: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setStoredSettings(value);
  };

  // Volume control helpers
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

  // UI settings helpers
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

  return {
    settings,
    setSettings,
    setMasterVolume,
    resetSettings,
    setShowInScaleColors,
    setKeyboardPreviewEnabled,
    setLearnTabletPianoHeight,
    setShowMiniPreview,
  };
}
