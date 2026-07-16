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

    it('bVI is Ab major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'bVI',
        rootNote: 'G#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('bVII is Bb major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'bVII',
        rootNote: 'A#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('bIII is Eb major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'bIII',
        rootNote: 'D#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });
  });

  describe('A minor (borrows from A major / parallel major)', () => {
    const borrowed = getBorrowedChords('A', 'minor');

    it('returns 4 borrowed chords', () => {
      expect(borrowed).toHaveLength(4);
    });

    it('IV is D major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'IV',
        rootNote: 'D',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('VI is F# major (major chord on the natural major 6th degree, not the natural minor vi)', () => {
      expect(borrowed).toContainEqual({
        numeral: 'VI',
        rootNote: 'F#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('VII is G# major (major chord on the natural major 7th degree, not the natural minor VII)', () => {
      expect(borrowed).toContainEqual({
        numeral: 'VII',
        rootNote: 'G#',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });

    it('III is C major', () => {
      expect(borrowed).toContainEqual({
        numeral: 'III',
        rootNote: 'C',
        intervals: [0, 4, 7],
        type: 'maj',
      });
    });
  });
});
