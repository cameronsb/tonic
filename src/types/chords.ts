/**
 * Chord Type Definitions
 */

/**
 * The complete set of valid chord modifier labels.
 *
 * Kept in sync with `CHORD_MODIFIERS` in `config/chords.ts`. Using this union
 * as the key type of `MODIFIER_CATEGORIES` (a `Record<ModifierLabel, ...>`)
 * forces every label to be categorized at compile time, and typing modifier
 * parameters/state as `ModifierLabel` makes a typo'd label a compile error.
 */
export type ModifierLabel =
  | '7'
  | 'sus4'
  | 'maj7'
  | 'sus2'
  | 'add9'
  | '9'
  | '6'
  | 'dim'
  | 'maj9'
  | '11'
  | '13'
  | 'aug';

/**
 * Chord modifier transformation rule.
 *
 * Modeled as a discriminated union on `kind` so the interval fields cannot be
 * combined contradictorily — each variant carries exactly the data it needs:
 * - `addOne`  — add a single interval (semitones from root)
 * - `addMany` — add multiple intervals (extended chords: 9th, 11th, 13th)
 * - `replace` — replace the entire chord structure (sus, dim, aug)
 */
export type ChordModifier = {
  /** Display label (e.g., '7', 'maj7', 'sus4') */
  label: ModifierLabel;
} & (
  | { kind: 'addOne'; interval: number }
  | { kind: 'addMany'; intervals: number[] }
  | { kind: 'replace'; intervals: number[] }
);
