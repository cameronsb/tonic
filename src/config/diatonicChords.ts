/**
 * Diatonic Chord Configuration
 *
 * The seven diatonic triads and seventh chords for the major and minor modes,
 * expressed as scale-degree numeral / quality / interval data. Concrete root
 * notes are computed at call time from the selected key.
 *
 * Rule of thumb: `config/` = data, `utils/` = behavior, `types/` = shapes.
 * Behavior that consumes this data lives in `src/utils/musicTheory.ts`.
 */

import type { Mode, ChordData } from '../types/music';

export const CHORD_TYPES: Record<Mode, ChordData> = {
  major: {
    triads: [
      { numeral: 'I', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'ii', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'iii', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'IV', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'V', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'vi', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'vii°', type: 'dim', intervals: [0, 3, 6] },
    ],
    sevenths: [
      { numeral: 'Imaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'ii7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'iii7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'IVmaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'V7', type: 'dom7', intervals: [0, 4, 7, 10] },
      { numeral: 'vi7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'viiø7', type: 'half-dim7', intervals: [0, 3, 6, 10] },
    ],
  },
  minor: {
    triads: [
      { numeral: 'i', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'ii°', type: 'dim', intervals: [0, 3, 6] },
      { numeral: 'III', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'iv', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'v', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'VI', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'VII', type: 'maj', intervals: [0, 4, 7] },
    ],
    sevenths: [
      { numeral: 'i7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'iiø7', type: 'half-dim7', intervals: [0, 3, 6, 10] },
      { numeral: 'IIImaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'iv7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'v7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'VImaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'VII7', type: 'dom7', intervals: [0, 4, 7, 10] },
    ],
  },
};
