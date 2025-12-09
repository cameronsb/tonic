/**
 * Configuration Index
 *
 * Central export point for application configuration.
 */

// UI configuration (panel sizes)
export * from './ui';

// Chord configuration (modifiers)
export * from './chords';

// Re-export types for convenience
export type { ChordModifier } from '../types/chords';
