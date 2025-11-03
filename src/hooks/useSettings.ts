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
      builderPanel: {
        ...DEFAULT_SETTINGS.ui.builderPanel,
        ...(stored.ui?.builderPanel || {}),
        rememberedHeights: {
          ...DEFAULT_SETTINGS.ui.builderPanel.rememberedHeights,
          ...(stored.ui?.builderPanel?.rememberedHeights || {}),
        },
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

  const setTrackVolume = (track: keyof UserSettings['volume']['tracks'], volume: number) => {
    setSettings((prev) => ({
      ...prev,
      volume: {
        ...prev.volume,
        tracks: {
          ...prev.volume.tracks,
          [track]: Math.max(0, Math.min(1, volume)),
        },
      },
    }));
  };

  const setDrumSoundVolume = (sound: keyof UserSettings['volume']['drumSounds'], volume: number) => {
    setSettings((prev) => ({
      ...prev,
      volume: {
        ...prev.volume,
        drumSounds: {
          ...prev.volume.drumSounds,
          [sound]: Math.max(0, Math.min(1, volume)),
        },
      },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // UI settings helpers
  const setBuilderPanelHeight = (height: number) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        builderPanel: {
          ...prev.ui.builderPanel,
          height: Math.max(150, Math.min(600, height)),
        },
      },
    }));
  };

  const setBuilderPanelTab = (tab: 'piano' | 'drums') => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        builderPanel: {
          ...prev.ui.builderPanel,
          activeTab: tab,
        },
      },
    }));
  };

  const setBuilderPanelRememberedHeight = (tab: 'piano' | 'drums', height: number) => {
    setSettings((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        builderPanel: {
          ...prev.ui.builderPanel,
          rememberedHeights: {
            ...prev.ui.builderPanel.rememberedHeights,
            [tab]: Math.max(150, Math.min(600, height)),
          },
        },
      },
    }));
  };

  return {
    settings,
    setSettings,
    setMasterVolume,
    setTrackVolume,
    setDrumSoundVolume,
    resetSettings,
    setBuilderPanelHeight,
    setBuilderPanelTab,
    setBuilderPanelRememberedHeight,
  };
}
