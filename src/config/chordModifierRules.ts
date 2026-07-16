/**
 * Chord Modifier Conflict Rules
 *
 * Defines which modifiers can be combined and which are mutually exclusive.
 * Used by long-press combination feature to auto-resolve conflicts.
 */

import type { ModifierLabel } from '../types/chords';

export type ModifierCategory =
  | 'seventh'
  | 'extension'
  | 'addition'
  | 'suspension'
  | 'quality';

/**
 * Maps each modifier label to its category.
 *
 * Keyed by `ModifierLabel` so the map must stay exhaustive: adding a new
 * modifier to `CHORD_MODIFIERS` without a category entry here is a compile error.
 */
export const MODIFIER_CATEGORIES: Record<ModifierLabel, ModifierCategory> = {
  // Seventh chords - add a 7th tone
  '7': 'seventh',
  'maj7': 'seventh',
  '6': 'seventh',

  // Extensions - pre-built stacks that include 7th
  '9': 'extension',
  'maj9': 'extension',
  '11': 'extension',
  '13': 'extension',

  // Additions - single tone additions
  'add9': 'addition',

  // Suspensions - replace the 3rd
  'sus2': 'suspension',
  'sus4': 'suspension',

  // Quality changes - replace entire triad
  'dim': 'quality',
  'aug': 'quality',
};

/**
 * When adding a modifier of category X, remove all modifiers of categories Y.
 * This includes the category itself for mutually exclusive groups.
 */
export const CATEGORY_CONFLICTS: Record<ModifierCategory, ModifierCategory[]> = {
  // 7/maj7/6 are mutually exclusive; also conflict with extensions (which include their own 7th)
  seventh: ['seventh', 'extension'],

  // Extensions are complete voicings - clear other extensions, sevenths, additions, and quality
  extension: ['extension', 'seventh', 'addition', 'quality'],

  // add9 conflicts with extensions (which already include the 9th)
  addition: ['addition', 'extension'],

  // sus2/sus4 are mutually exclusive; conflict with quality (which defines a 3rd)
  suspension: ['suspension', 'quality'],

  // dim/aug are mutually exclusive; conflict with sus (needs 3rd), extensions, additions
  quality: ['quality', 'suspension', 'extension', 'addition'],
};

/**
 * Get all modifiers that conflict with the one being added.
 * Used to auto-remove conflicting modifiers when combining via long-press.
 */
export function getConflictingModifiers(
  modifierToAdd: ModifierLabel,
  activeModifiers: Set<ModifierLabel>
): ModifierLabel[] {
  const category = MODIFIER_CATEGORIES[modifierToAdd];
  if (!category) return [];

  const conflictingCategories = CATEGORY_CONFLICTS[category];
  const conflicts: ModifierLabel[] = [];

  activeModifiers.forEach((activeModifier) => {
    const activeCategory = MODIFIER_CATEGORIES[activeModifier];
    if (activeCategory && conflictingCategories.includes(activeCategory)) {
      conflicts.push(activeModifier);
    }
  });

  return conflicts;
}
