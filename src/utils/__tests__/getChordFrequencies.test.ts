/**
 * getChordFrequencies Test Suite
 *
 * Behavior-pinning tests for chord-to-frequency conversion
 * (src/utils/musicTheory.ts:325), ahead of the P4-2 refactor that
 * consolidates the equal-temperament formula into `midiToFrequency`.
 */

import { describe, it, expect } from 'vitest';
import { getChordFrequencies } from '../musicTheory';

describe('getChordFrequencies', () => {
  it('C major triad at octave 4 matches standard equal-temperament frequencies', () => {
    const frequencies = getChordFrequencies('C', [0, 4, 7], 4);
    expect(frequencies[0]).toBeCloseTo(261.63, 1); // C4
    expect(frequencies[1]).toBeCloseTo(329.63, 1); // E4
    expect(frequencies[2]).toBeCloseTo(392.0, 1); // G4
  });

  it('defaults to octave 4 when no octave argument is given', () => {
    const withDefault = getChordFrequencies('C', [0, 4, 7]);
    const explicit = getChordFrequencies('C', [0, 4, 7], 4);
    expect(withDefault).toEqual(explicit);
  });

  it('a wrap-around interval bumps the octave up', () => {
    // A4 + a major third (interval 4) wraps past B into C#, one octave higher.
    const frequencies = getChordFrequencies('A', [0, 4], 4);
    // Root: A4 = 440
    expect(frequencies[0]).toBeCloseTo(440, 1);
    // Third: C#5 (wrapped into octave 5) ~ 554.37
    expect(frequencies[1]).toBeCloseTo(554.37, 1);
  });

  it('respects a non-default octave', () => {
    const frequencies = getChordFrequencies('A', [0], 5);
    expect(frequencies[0]).toBeCloseTo(880, 1); // A5
  });
});
