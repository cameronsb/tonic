/**
 * useChordModifiers Hook
 * 
 * Manages chord modifier state and application logic.
 * Separates modifier business logic from component rendering.
 * 
 * @example
 * ```typescript
 * const { activeModifiers, currentIntervals, applyModifier, reset } = useChordModifiers({
 *   initialIntervals: [0, 4, 7], // Major triad intervals
 * });
 * 
 * // Apply a 7th chord modifier
 * applyModifier('7');
 * // currentIntervals is now [0, 4, 7, 10]
 * ```
 */

import { useState, useCallback } from 'react';
import { CHORD_MODIFIERS } from '../config';

/**
 * Hook options
 */
interface UseChordModifiersOptions {
  /** Base chord intervals (before any modifiers) */
  initialIntervals: number[];
  
  /** Callback when modifiers change */
  onChange?: (intervals: number[], modifiers: Set<string>) => void;
}

/**
 * Hook return value
 */
interface UseChordModifiersReturn {
  /** Set of currently active modifier labels */
  activeModifiers: Set<string>;
  
  /** Current chord intervals after all modifiers applied */
  currentIntervals: number[];
  
  /** Apply or remove a chord modifier */
  applyModifier: (modifierLabel: string) => void;
  
  /** Reset to base chord (clear all modifiers) */
  reset: () => void;
  
  /** Check if a modifier is currently active */
  isModifierActive: (modifierLabel: string) => boolean;
}

/**
 * Custom hook for managing chord modifiers
 * 
 * Handles the logic of applying and removing chord modifiers,
 * maintaining the set of active modifiers and calculating
 * the resulting chord intervals.
 * 
 * @param options - Hook configuration
 * @returns Modifier state and control functions
 */
export function useChordModifiers(
  options: UseChordModifiersOptions
): UseChordModifiersReturn {
  const { initialIntervals, onChange } = options;
  
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [currentIntervals, setCurrentIntervals] = useState<number[]>(initialIntervals);

  /**
   * Apply or remove a chord modifier
   * Toggles the modifier on/off and recalculates intervals
   */
  const applyModifier = useCallback((modifierLabel: string) => {
    const modifier = CHORD_MODIFIERS.find(m => m.label === modifierLabel);
    if (!modifier) {
      console.warn(`Unknown modifier: ${modifierLabel}`);
      return;
    }

    // Toggle modifier in the set
    const newModifiers = new Set(activeModifiers);
    const isActive = newModifiers.has(modifierLabel);

    if (isActive) {
      newModifiers.delete(modifierLabel);
    } else {
      newModifiers.add(modifierLabel);
    }

    // Recalculate intervals based on all active modifiers
    let newIntervals = [...initialIntervals];

    newModifiers.forEach((label) => {
      const mod = CHORD_MODIFIERS.find(m => m.label === label);
      if (!mod) return;

      // Apply modifier transformation
      if (mod.replaceWith) {
        // Replace entire chord structure (sus, dim, aug)
        newIntervals = mod.replaceWith;
      } else if (mod.intervalsToAdd) {
        // Add multiple intervals (extended chords like 9, 11, 13)
        mod.intervalsToAdd.forEach((interval) => {
          if (!newIntervals.includes(interval)) {
            newIntervals.push(interval);
          }
        });
      } else if (mod.intervalToAdd !== undefined) {
        // Add single interval (7th, 6th, add9)
        if (!newIntervals.includes(mod.intervalToAdd)) {
          newIntervals.push(mod.intervalToAdd);
        }
      } else if (mod.intervalToRemove !== undefined) {
        // Remove specific interval
        newIntervals = newIntervals.filter(i => i !== mod.intervalToRemove);
      }
    });

    // Sort intervals in ascending order
    newIntervals.sort((a, b) => a - b);

    // Update state
    setActiveModifiers(newModifiers);
    setCurrentIntervals(newIntervals);

    // Notify parent if callback provided
    onChange?.(newIntervals, newModifiers);
  }, [activeModifiers, initialIntervals, onChange]);

  /**
   * Reset to base chord (remove all modifiers)
   */
  const reset = useCallback(() => {
    setActiveModifiers(new Set());
    setCurrentIntervals(initialIntervals);
    onChange?.(initialIntervals, new Set());
  }, [initialIntervals, onChange]);

  /**
   * Check if a specific modifier is currently active
   */
  const isModifierActive = useCallback((modifierLabel: string): boolean => {
    return activeModifiers.has(modifierLabel);
  }, [activeModifiers]);

  return {
    activeModifiers,
    currentIntervals,
    applyModifier,
    reset,
    isModifierActive,
  };
}

