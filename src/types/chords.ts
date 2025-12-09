/**
 * Chord Type Definitions
 */

/**
 * Chord modifier transformation rules
 * Defines how chord modifiers transform the base chord intervals
 */
export interface ChordModifier {
  /** Display label (e.g., '7', 'maj7', 'sus4') */
  label: string;

  /** Add a single interval (in semitones from root) */
  intervalToAdd?: number;

  /** Add multiple intervals (for extended chords like 9th, 11th, 13th) */
  intervalsToAdd?: number[];

  /** Remove a specific interval from the chord */
  intervalToRemove?: number;

  /** Replace the entire chord structure (for sus, dim, aug) */
  replaceWith?: number[];
}
