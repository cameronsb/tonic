/**
 * Chord Configuration
 *
 * Chord modifiers for harmonic variations.
 */

import type { ChordModifier } from '../types/chords';

/**
 * Chord modifiers for harmonic variations
 *
 * Organized in 2 rows of 6 for complete harmonic palette:
 * - Row 1: Seventh chords, suspended, and altered triads
 * - Row 2: Extended harmony and added tones
 *
 * Intervals are in semitones from root (0=root, 12=octave)
 */
export const CHORD_MODIFIERS: ChordModifier[] = [
  // Row 1: Seventh chords, suspended, diminished
  { label: '7', intervalToAdd: 10 },           // Dominant 7th: adds b7
  { label: 'maj7', intervalToAdd: 11 },        // Major 7th: adds maj7
  { label: '6', intervalToAdd: 9 },            // Major 6th: adds 6th
  { label: 'sus2', replaceWith: [0, 2, 7] },   // Suspended 2nd: replaces 3rd with 2nd
  { label: 'sus4', replaceWith: [0, 5, 7] },   // Suspended 4th: replaces 3rd with 4th
  { label: 'dim', replaceWith: [0, 3, 6] },    // Diminished triad: b3 + b5

  // Row 2: Extended chords and augmented
  { label: '9', intervalsToAdd: [10, 14] },      // Dominant 9th: b7 + 9th
  { label: 'maj9', intervalsToAdd: [11, 14] },   // Major 9th: maj7 + 9th
  { label: '11', intervalsToAdd: [10, 14, 17] }, // Dominant 11th: b7 + 9th + 11th
  { label: '13', intervalsToAdd: [10, 14, 21] }, // Dominant 13th: b7 + 9th + 13th
  { label: 'add9', intervalToAdd: 14 },          // Add 9: just 9th (no 7th)
  { label: 'aug', replaceWith: [0, 4, 8] },      // Augmented triad: major 3rd + #5
];
