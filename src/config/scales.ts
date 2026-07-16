/**
 * Scale Configuration
 *
 * Static music-theory domain data for notes and scales: the chromatic note
 * set, scale interval formulas, and per-tonic enharmonic spellings.
 *
 * Rule of thumb: `config/` = data, `utils/` = behavior, `types/` = shapes.
 * Behavior that consumes this data lives in `src/utils/musicTheory.ts`.
 */

import type { Note } from '../types/music';

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// Standard major scale spellings for all 12 tonics
// Using circle of fifths conventions: sharp keys use sharps, flat keys use flats
// Each scale must use each letter name exactly once (C-D-E-F-G-A-B)
export const MAJOR_SCALE_SPELLINGS: Record<Note, string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'C#': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'], // Db major (5 flats)
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'D#': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'], // Eb major (3 flats)
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'], // F# major (6 sharps)
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'G#': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'], // Ab major (4 flats)
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'A#': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'], // Bb major (2 flats)
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
};

// Standard natural minor scale spellings for all 12 tonics
// Minor keys use the same key signature as their relative major
export const MINOR_SCALE_SPELLINGS: Record<Note, string[]> = {
  C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // C minor (3 flats, relative to Eb major)
  'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'], // C# minor (4 sharps, relative to E major)
  D: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'], // D minor (1 flat, relative to F major)
  'D#': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'], // Eb minor (6 flats, relative to Gb major)
  E: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'], // E minor (1 sharp, relative to G major)
  F: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'], // F minor (4 flats, relative to Ab major)
  'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'], // F# minor (3 sharps, relative to A major)
  G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'], // G minor (2 flats, relative to Bb major)
  'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'], // G# minor (5 sharps, relative to B major)
  A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // A minor (0 sharps/flats, relative to C major)
  'A#': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'], // Bb minor (5 flats, relative to Db major)
  B: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'], // B minor (2 sharps, relative to D major)
};
