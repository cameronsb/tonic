/**
 * Chord Configuration
 *
 * Chord modifiers for harmonic variations.
 */

import type { ChordModifier } from '../types/chords';

/**
 * Chord modifiers for harmonic variations
 *
 * Ordered by frequency of use (most common first) for intuitive learning:
 * - Row 1: Essential (7, sus4, maj7) - 80% of modified chords in pop/rock
 * - Row 2: Common color (sus2, add9, 9) - modern pop, acoustic, neo-soul
 * - Row 3: Intermediate (6, dim, maj9) - jazz standards, passing chords
 * - Row 4: Advanced (11, 13, aug) - jazz voicings, chromatic movement
 *
 * Intervals are in semitones from root (0=root, 12=octave)
 */
export const CHORD_MODIFIERS: ChordModifier[] = [
  // Row 1: Essential - the most common modifications
  { label: '7', kind: 'addOne', interval: 10 }, // Dominant 7th: the gateway modifier
  { label: 'sus4', kind: 'replace', intervals: [0, 5, 7] }, // Suspended 4th: pop/rock staple
  { label: 'maj7', kind: 'addOne', interval: 11 }, // Major 7th: jazz/pop crossover

  // Row 2: Common color additions
  { label: 'sus2', kind: 'replace', intervals: [0, 2, 7] }, // Suspended 2nd: modern alternative to sus4
  { label: 'add9', kind: 'addOne', interval: 14 }, // Add 9: easy color without 7th
  { label: '9', kind: 'addMany', intervals: [10, 14] }, // Dominant 9th: jazz/funk essential

  // Row 3: Intermediate harmony
  { label: '6', kind: 'addOne', interval: 9 }, // Major 6th: classic jazz sound
  { label: 'dim', kind: 'replace', intervals: [0, 3, 6] }, // Diminished: tension/passing chords
  { label: 'maj9', kind: 'addMany', intervals: [11, 14] }, // Major 9th: sophisticated color

  // Row 4: Advanced extensions
  { label: '11', kind: 'addMany', intervals: [10, 14, 17] }, // Dominant 11th: jazz extended
  { label: '13', kind: 'addMany', intervals: [10, 14, 21] }, // Dominant 13th: full jazz voicing
  { label: 'aug', kind: 'replace', intervals: [0, 4, 8] }, // Augmented: chromatic movement
];
