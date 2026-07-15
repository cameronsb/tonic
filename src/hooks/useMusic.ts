import { useContext } from 'react';
import { MusicStateContext, MusicActionsContext } from '../contexts/MusicContext';

/**
 * Read music state: `state`, `settings`, and audio load-status (`audio.loading`,
 * `audio.error`, `audio.audioContext`, `audio.instrument`). Consumers re-render
 * when any of these change.
 */
export function useMusicState() {
  const context = useContext(MusicStateContext);
  if (!context) {
    throw new Error('useMusicState must be used within a MusicProvider');
  }
  return context;
}

/**
 * Read music actions: dispatch wrappers (`actions.*`) and stable audio playback
 * triggers (`audio.playNote`, `audio.playChord`, `audio.retry`). This value never
 * changes after mount, so action-only consumers skip state-change re-renders.
 */
export function useMusicActions() {
  const context = useContext(MusicActionsContext);
  if (!context) {
    throw new Error('useMusicActions must be used within a MusicProvider');
  }
  return context;
}
