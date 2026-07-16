/**
 * generatePianoKeys Test Suite
 *
 * Behavior-pinning tests for the live piano-key generator
 * (src/utils/pianoUtils.ts:32) — the function that actually drives the
 * rendered piano, as opposed to the dead 88-key subsystem in musicTheory.ts.
 */

import { describe, it, expect } from 'vitest';
import { generatePianoKeys, getWhiteKeyCount } from '../pianoUtils';

describe('generatePianoKeys', () => {
  describe('one octave (startOctave=4, octaveCount=1)', () => {
    const keys = generatePianoKeys(4, 1);

    it('returns 13 keys: 12 semitones plus the trailing C of the next octave', () => {
      expect(keys).toHaveLength(13);
    });

    it('has 8 white keys (7 in-octave plus the trailing C)', () => {
      expect(getWhiteKeyCount(keys)).toBe(8);
    });

    it('appends a final C at the next octave', () => {
      const last = keys[keys.length - 1];
      expect(last).toMatchObject({ note: 'C5', baseNote: 'C', octave: 5, isBlack: false });
    });

    it('follows the standard black-key pattern (C#, D#, F#, G#, A# are black)', () => {
      const blackNotes = keys
        .filter((k) => k.isBlack)
        .map((k) => k.baseNote);
      expect(blackNotes).toEqual(['C#', 'D#', 'F#', 'G#', 'A#']);
    });

    it('whiteKeyIndex is monotonically non-decreasing across the key list', () => {
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i].whiteKeyIndex).toBeGreaterThanOrEqual(keys[i - 1].whiteKeyIndex);
      }
    });

    it('white keys get sequential whiteKeyIndex values starting at 0', () => {
      const whiteIndexes = keys.filter((k) => !k.isBlack).map((k) => k.whiteKeyIndex);
      expect(whiteIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('a black key\'s whiteKeyIndex points to the white key to its left', () => {
      // C#4 follows C4 (whiteKeyIndex 0), so C#4 should report 0.
      const cSharp = keys.find((k) => k.baseNote === 'C#');
      expect(cSharp?.whiteKeyIndex).toBe(0);
    });
  });

  describe('multiple octaves (startOctave=3, octaveCount=2)', () => {
    const keys = generatePianoKeys(3, 2);

    it('returns 25 keys: 24 semitones plus the trailing C', () => {
      expect(keys).toHaveLength(25);
    });

    it('has 15 white keys (14 in-range plus the trailing C)', () => {
      expect(getWhiteKeyCount(keys)).toBe(15);
    });

    it('spans octaves 3 through 5 (the trailing C lands on octave 5)', () => {
      const octaves = new Set(keys.map((k) => k.octave));
      expect(octaves).toEqual(new Set([3, 4, 5]));
    });
  });

  describe('MIDI numbers and frequencies', () => {
    const keys = generatePianoKeys(4, 1);

    it('C4 is MIDI 60', () => {
      const c4 = keys.find((k) => k.note === 'C4');
      expect(c4?.midiNumber).toBe(60);
    });

    it('frequencies follow equal temperament (A4 = 440Hz when present)', () => {
      const a4 = generatePianoKeys(4, 1).find((k) => k.note === 'A4');
      expect(a4?.frequency).toBeCloseTo(440, 1);
    });
  });
});
