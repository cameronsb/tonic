/**
 * getChordDisplayName Test Suite
 *
 * Behavior-pinning tests for the chord display name formatter
 * (src/utils/musicTheory.ts:759). These pin CURRENT behavior ahead of the
 * P3-1/P3-2 type refactors so any drift during those changes is caught.
 */

import { describe, it, expect } from 'vitest';
import { getChordDisplayName } from '../musicTheory';
import type { ModifierLabel } from '../../types/chords';

describe('getChordDisplayName', () => {
  describe('base cases (no modifiers use the base chord type)', () => {
    it.each<[string, 'maj' | 'min' | 'dim', number[], string]>([
      ['maj', 'maj', [0, 4, 7], 'C'],
      ['min', 'min', [0, 3, 7], 'Cm'],
      ['dim', 'dim', [0, 3, 6], 'C°'],
    ])('%s base type with no modifiers -> %s', (_label, baseType, baseIntervals, expected) => {
      expect(getChordDisplayName('C', baseType, baseIntervals, new Set())).toBe(expected);
    });

    it('aug modifier (with maj base) replaces the triad -> C+', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['aug']))).toBe('C+');
    });

    it('dim modifier (with maj base) replaces the triad -> C°', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['dim']))).toBe('C°');
    });
  });

  describe('single modifiers', () => {
    it.each<[ModifierLabel, string]>([
      ['7', 'C7'],
      ['maj7', 'Cmaj7'],
      ['add9', 'Cadd9'],
      ['sus4', 'Csus4'],
      ['sus2', 'Csus2'],
      ['6', 'C6'],
      ['9', 'C9'],
      ['maj9', 'Cmaj9'],
      ['11', 'C11'],
      ['13', 'C13'],
    ])('{%s} on a maj base -> %s', (modifier, expected) => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set([modifier]))).toBe(expected);
    });

    it('single modifier on a min base includes the "m" quality', () => {
      expect(getChordDisplayName('C', 'min', [0, 3, 7], new Set(['7']))).toBe('Cm7');
    });
  });

  describe('priority ladder (13 > 11 > 9/maj9 > 7/maj7/6)', () => {
    it('{7, 9, 13} collapses to just 13', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['7', '9', '13']))).toBe('C13');
    });

    it('{7, 9, 11} collapses to just 11', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['7', '9', '11']))).toBe('C11');
    });

    it('{7, 9} collapses to just 9 (dominant 9th)', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['7', '9']))).toBe('C9');
    });

    it('{maj9, 9} collapses to maj9 (maj9 modifier itself takes priority over plain 9)', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['maj9', '9']))).toBe('Cmaj9');
    });

    it('{maj7, 9} does NOT combine into maj9 — plain 9 wins since only a literal "maj9" modifier triggers that label', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['maj7', '9']))).toBe('C9');
    });

    it('{7, 6} prefers 7 over 6', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['7', '6']))).toBe('C7');
    });

    it('{7, add9} prefers 7 over add9 (add9 only shows with nothing higher active)', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['7', 'add9']))).toBe('C7');
    });
  });

  describe('sus + extension edge cases', () => {
    it('sus4 alone -> Csus4', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus4']))).toBe('Csus4');
    });

    it('sus2 alone -> Csus2', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus2']))).toBe('Csus2');
    });

    it('{sus4, 9} appends the non-seventh extension after the sus label', () => {
      // Current behavior: extensions are filtered to exclude anything
      // containing '7', so '9' is appended directly after 'sus4'.
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus4', '9']))).toBe('Csus49');
    });

    it('{sus2, add9} appends add9 after the sus label', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus2', 'add9']))).toBe(
        'Csus2add9'
      );
    });

    it('{sus4, 7} drops the seventh (filtered out of extensions)', () => {
      // Current behavior: the extensions filter excludes any modifier whose
      // name includes '7', so a bare '7' alongside sus4 is silently dropped.
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus4', '7']))).toBe('Csus4');
    });

    it('dim takes priority over sus (checked before the sus branch)', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus4', 'dim']))).toBe('C°');
    });

    it('aug takes priority over sus (checked before the sus branch)', () => {
      expect(getChordDisplayName('C', 'maj', [0, 4, 7], new Set(['sus2', 'aug']))).toBe('C+');
    });
  });
});
