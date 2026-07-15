import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

/**
 * Access the single application-wide settings store.
 *
 * All settings state lives in one `SettingsProvider` mounted at the app root;
 * this hook is a thin `useContext` wrapper so every consumer reads from — and
 * writes to — the same source of truth.
 */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
