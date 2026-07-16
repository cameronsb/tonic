/**
 * getBorrowedChords Test Suite
 *
 * Behavior-pinning tests for modal-interchange chord generation
 * (src/utils/musicTheory.ts:650) — a copy-paste-error-prone block of
 * hand-written push statements. Pins root/interval/type/numeral for every
 * borrowed chord before the P4-3 table-driven refactor.
 */

import { describe, it, expect } from 'vitest';
import { getBorrowedChords } from '../musicTheory';

describe('getBorrowedChords', () => {
  describe('C major (borrows from C minor / parallel minor)', () => {
    const borrowed = getBorrowedChords('C', 'major');

    it('returns 4 borrowed chords', () => {
      expect(borrowed).toHaveLength(4);
    });

    it('iv is F minor', () => {
      expect(borrowed).toContainEqual({
        numeral: 'iv',
        rootNote: 'F',
        intervals: [0, 3, 7],
        type: 'min',
      });
    });

    it('♭VI is Ab major', () => {
      expect(borrowed).toContainEqual({
        numeral: '♭VI',
        rootNote: 'G#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('♭VII is Bb major', () => {
      expect(borrowed).toContainEqual({
        numeral: '♭VII',
        rootNote: 'A#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('♭III is Eb major', () => {
      expect(borrowed).toContainEqual({
        numeral: '♭III',
        rootNote: 'D#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });
  });

  describe('A minor (borrows from A major / parallel major)', () => {
    const borrowed = getBorrowedChords('A', 'minor');

    // True modal interchange: the borrowed set is diatonic to the parallel
    // MAJOR key (A major), so qualities match that scale — I & IV major, vi
    // minor, vii° diminished. The duplicate diatonic III (C major) is dropped.

    it('returns 4 borrowed chords', () => {
      expect(borrowed).toHaveLength(4);
    });

    it('I is A major (Picardy tonic — major triad on the tonic)', () => {
      expect(borrowed).toContainEqual({
        numeral: 'I',
        rootNote: 'A',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('IV is D major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'IV',
        rootNote: 'D',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('vi is F# minor (minor triad on the raised 6th degree, per the parallel major)', () => {
      expect(borrowed).toContainEqual({
        numeral: 'vi',
        rootNote: 'F#',
        intervals: [0, 3, 7],
        type: 'min',
      });
    });

    it('vii° is G# diminished (leading-tone diminished triad, per the parallel major)', () => {
      expect(borrowed).toContainEqual({
        numeral: 'vii°',
        rootNote: 'G#',
        intervals: [0, 3, 6],
        type: 'dim',
      });
    });

    it('does not include the old major VI / VII / III that duplicated the diatonic III', () => {
      const numerals = borrowed.map((c) => c.numeral);
      expect(numerals).not.toContain('VI');
      expect(numerals).not.toContain('VII');
      expect(numerals).not.toContain('III');
    });
  });
});
