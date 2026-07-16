/**
 * useSettings Test Suite
 *
 * Behavior-pinning tests for the settings merge + legacy-migration logic in
 * SettingsContext.tsx, exercised through the public `useSettings` hook via
 * `renderHook`. `getInitialSettings` guards itself with a module-level
 * `didInitialize` flag, so each test that cares about migration/merge from a
 * specific localStorage starting state resets modules and re-imports fresh.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

describe('useSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('throws when used outside a SettingsProvider', async () => {
    const { useSettings } = await import('../useSettings');
    // renderHook without a wrapper — no SettingsProvider in the tree.
    expect(() => renderHook(() => useSettings())).toThrowError(
      'useSettings must be used within a SettingsProvider'
    );
  });

  it('returns the default settings when localStorage is empty', async () => {
    const { useSettings } = await import('../useSettings');
    const { SettingsProvider } = await import('../../contexts/SettingsContext');
    const { DEFAULT_SETTINGS } = await import('../../types/settings');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('merges a stored partial settings object with defaults without dropping nested keys', async () => {
    const { STORAGE_KEYS } = await import('../../types/settings');
    // Only override master volume and one nested UI flag — everything else
    // (chords volume, other ui.piano flags, onboarding, etc.) must survive
    // the merge from defaults.
    window.localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        volume: { master: 0.9 },
        ui: { piano: { showInScaleColors: false } },
      })
    );

    const { useSettings } = await import('../useSettings');
    const { SettingsProvider } = await import('../../contexts/SettingsContext');
    const { DEFAULT_SETTINGS } = await import('../../types/settings');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.volume.master).toBe(0.9);
    // Nested key not present in the stored partial falls back to default.
    expect(result.current.settings.volume.chords).toBe(DEFAULT_SETTINGS.volume.chords);
    expect(result.current.settings.ui.piano.showInScaleColors).toBe(false);
    // Sibling nested key under ui.piano not present in the stored partial.
    expect(result.current.settings.ui.piano.keyboardPreviewEnabled).toBe(
      DEFAULT_SETTINGS.ui.piano.keyboardPreviewEnabled
    );
    // Untouched top-level nested groups survive entirely.
    expect(result.current.settings.ui.chordStrip).toEqual(DEFAULT_SETTINGS.ui.chordStrip);
    expect(result.current.settings.onboarding).toEqual(DEFAULT_SETTINGS.onboarding);
  });

  it('migrates a legacy settings blob and deletes the legacy keys', async () => {
    const { LEGACY_STORAGE_KEYS, STORAGE_KEYS } = await import('../../types/settings');

    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        volume: { master: 0.3, tracks: { chords: 0.6 } },
        ui: { piano: { showMiniPreview: false } },
      })
    );
    window.localStorage.setItem(LEGACY_STORAGE_KEYS.SONGS, '[]');
    window.localStorage.setItem(LEGACY_STORAGE_KEYS.ACTIVE_SONG_ID, 'song-1');

    const { useSettings } = await import('../useSettings');
    const { SettingsProvider } = await import('../../contexts/SettingsContext');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const { result } = renderHook(() => useSettings(), { wrapper });

    // Legacy volume shape (nested under `tracks.chords`) is flattened into
    // the current shape (`volume.chords`).
    expect(result.current.settings.volume.master).toBe(0.3);
    expect(result.current.settings.volume.chords).toBe(0.6);

    // Legacy keys are removed as a side effect of migration.
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEYS.SETTINGS)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEYS.SONGS)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEYS.ACTIVE_SONG_ID)).toBeNull();

    // The merged result is persisted under the current key.
    expect(window.localStorage.getItem(STORAGE_KEYS.SETTINGS)).not.toBeNull();
  });

  it('a current-key value takes precedence over a legacy blob when both exist', async () => {
    const { LEGACY_STORAGE_KEYS, STORAGE_KEYS } = await import('../../types/settings');

    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.SETTINGS,
      JSON.stringify({ volume: { master: 0.1, tracks: { chords: 0.1 } } })
    );
    window.localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ volume: { master: 0.7 } })
    );

    const { useSettings } = await import('../useSettings');
    const { SettingsProvider } = await import('../../contexts/SettingsContext');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.volume.master).toBe(0.7);
  });

  it('setMasterVolume clamps to [0, 1] and updates state', async () => {
    const { useSettings } = await import('../useSettings');
    const { SettingsProvider } = await import('../../contexts/SettingsContext');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setMasterVolume(1.5);
    });
    expect(result.current.settings.volume.master).toBe(1);

    act(() => {
      result.current.setMasterVolume(-0.5);
    });
    expect(result.current.settings.volume.master).toBe(0);
  });
});
