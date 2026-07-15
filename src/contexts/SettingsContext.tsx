import { createContext, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { UserSettings } from '../types/settings';
import { DEFAULT_SETTINGS, STORAGE_KEYS, LEGACY_STORAGE_KEYS } from '../types/settings';

/**
 * Migrate settings persisted under a legacy storage key into the current shape.
 *
 * Returns a partial settings object (merged with defaults by the caller) or
 * `null` when there is nothing to migrate. Legacy keys are removed as a side
 * effect. This is invoked exactly once (see `getInitialSettings`), never during
 * a React render.
 */
function migrateLegacyStorage(): Partial<UserSettings> | null {
  try {
    const legacySettings = window.localStorage.getItem(LEGACY_STORAGE_KEYS.SETTINGS);

    if (legacySettings) {
      const parsed = JSON.parse(legacySettings);

      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.SETTINGS);
      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.SONGS);
      window.localStorage.removeItem(LEGACY_STORAGE_KEYS.ACTIVE_SONG_ID);

      return {
        volume: {
          master: parsed.volume?.master ?? DEFAULT_SETTINGS.volume.master,
          chords: parsed.volume?.tracks?.chords ?? DEFAULT_SETTINGS.volume.chords,
        },
        ui: parsed.ui,
      };
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

/**
 * Compute the fully-merged initial settings exactly once.
 *
 * Runs legacy migration, merges any stored value with defaults, and persists
 * the merged result back to localStorage a single time. A module-level guard
 * makes this idempotent so React StrictMode's double-invocation (or a remount)
 * cannot re-run the migration side effects.
 */
let didInitialize = false;
let cachedInitialSettings: UserSettings;

function getInitialSettings(): UserSettings {
  if (didInitialize) {
    return cachedInitialSettings;
  }
  didInitialize = true;

  let stored: Partial<UserSettings> = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading stored settings:', error);
  }

  const legacy = migrateLegacyStorage();
  // Current key wins over legacy; defaults fill any gaps.
  const merged = mergeWithDefaults({ ...(legacy ?? {}), ...stored });

  try {
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  } catch (error) {
    console.error('Error persisting merged settings:', error);
  }

  cachedInitialSettings = merged;
  return merged;
}

export interface SettingsContextValue {
  settings: UserSettings;
  setSettings: (value: UserSettings | ((prev: UserSettings) => UserSettings)) => void;
  setMasterVolume: (volume: number) => void;
  resetSettings: () => void;
  setShowInScaleColors: (show: boolean) => void;
  setKeyboardPreviewEnabled: (enabled: boolean) => void;
  setLearnTabletPianoHeight: (height: number) => void;
  setShowMiniPreview: (show: boolean) => void;
  setShowBorrowed: (show: boolean) => void;
  setScaleViewEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setStoredSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEYS.SETTINGS,
    getInitialSettings()
  );

  const setSettings = setStoredSettings;

  const setMasterVolume = useCallback(
    (volume: number) => {
      setSettings((prev) => ({
        ...prev,
        volume: {
          ...prev.volume,
          master: Math.max(0, Math.min(1, volume)),
        },
      }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const setShowInScaleColors = useCallback(
    (show: boolean) => {
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
    },
    [setSettings]
  );

  const setKeyboardPreviewEnabled = useCallback(
    (enabled: boolean) => {
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
    },
    [setSettings]
  );

  const setLearnTabletPianoHeight = useCallback(
    (height: number) => {
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
    },
    [setSettings]
  );

  const setShowMiniPreview = useCallback(
    (show: boolean) => {
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
    },
    [setSettings]
  );

  const setShowBorrowed = useCallback(
    (show: boolean) => {
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
    },
    [setSettings]
  );

  const setScaleViewEnabled = useCallback(
    (enabled: boolean) => {
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
    },
    [setSettings]
  );

  const completeOnboarding = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    }));
  }, [setSettings]);

  const skipOnboarding = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        completed: true,
        skippedAt: new Date().toISOString(),
      },
    }));
  }, [setSettings]);

  const resetOnboarding = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        completed: false,
        completedAt: null,
        skippedAt: null,
      },
    }));
  }, [setSettings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
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
    }),
    [
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
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
