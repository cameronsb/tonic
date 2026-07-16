/**
 * getConflictingModifiers Test Suite
 *
 * Behavior-pinning tests for the modifier-conflict resolver
 * (src/config/chordModifierRules.ts:67), used by the long-press
 * auto-resolve-conflicts feature.
 */

import { describe, it, expect } from 'vitest';
import { getConflictingModifiers } from '../chordModifierRules';

describe('getConflictingModifiers', () => {
  it('adding "7" (seventh) clears an active "maj7" (also seventh category)', () => {
    const conflicts = getConflictingModifiers('7', new Set(['maj7']));
    expect(conflicts).toEqual(['maj7']);
  });

  it('adding "sus4" clears an active "dim" (quality conflicts with suspension)', () => {
    const conflicts = getConflictingModifiers('sus4', new Set(['dim']));
    expect(conflicts).toEqual(['dim']);
  });

  it('an unknown modifier label returns no conflicts', () => {
    expect(getConflictingModifiers('not-a-real-modifier', new Set(['7', 'sus4']))).toEqual([]);
  });

  it('an empty active-modifiers set returns no conflicts', () => {
    expect(getConflictingModifiers('7', new Set())).toEqual([]);
  });

  it('adding an extension ("9") clears seventh, addition, and quality categories', () => {
    const conflicts = getConflictingModifiers('9', new Set(['7', 'add9', 'dim', 'sus4']));
    expect(conflicts).toEqual(expect.arrayContaining(['7', 'add9', 'dim']));
    expect(conflicts).not.toContain('sus4');
  });

  it('adding "add9" clears an active extension but not an active seventh', () => {
    const conflicts = getConflictingModifiers('add9', new Set(['13', '7']));
    expect(conflicts).toEqual(['13']);
  });

  it('adding "dim" (quality) clears suspension, extension, and addition categories', () => {
    const conflicts = getConflictingModifiers('dim', new Set(['sus2', '11', 'add9', 'aug']));
    expect(conflicts.sort()).toEqual(['11', 'add9', 'aug', 'sus2'].sort());
  });

  it('a modifier does not conflict with itself unless another instance is active', () => {
    // Adding "sus4" while "sus4" is already active: both are in the
    // suspension category, so the existing "sus4" is reported as a conflict.
    expect(getConflictingModifiers('sus4', new Set(['sus4']))).toEqual(['sus4']);
  });
});
