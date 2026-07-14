import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMusic } from '../hooks/useMusic';
import {
  getFullChordName,
  getChordDisplayName,
  getChordFrequencies,
  NOTES,
  getScaleDegreeLabel,
} from '../utils/musicTheory';
import { CHORD_MODIFIERS } from '../config/chords';
import { getConflictingModifiers } from '../config/chordModifierRules';
import type { Note, Mode, ChordType } from '../types/music';
import './ChordCard.css';

const LONG_PRESS_MS = 400;

interface ChordCardProps {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
  isDiatonic: boolean;
  keyRoot: Note;
  mode: Mode;
  showPreview?: boolean;
}

export function ChordCard({
  numeral,
  rootNote,
  intervals: baseIntervals,
  type: baseType,
  isDiatonic,
  keyRoot,
  mode,
  showPreview = true,
}: ChordCardProps) {
  const { audio, actions, state } = useMusic();

  // Locked modifiers persist until explicitly unlocked via long-press
  const [lockedModifiers, setLockedModifiers] = useState<Set<string>>(new Set());
  // Temp modifier is selected via tap, can be toggled off by tapping again
  const [tempModifier, setTempModifier] = useState<string | null>(null);
  const [currentIntervals, setCurrentIntervals] = useState<number[]>(baseIntervals);

  // Active modifiers = locked + temp (if any)
  const activeModifiers = useMemo(() => {
    const active = new Set(lockedModifiers);
    if (tempModifier) active.add(tempModifier);
    return active;
  }, [lockedModifiers, tempModifier]);

  // Reset modifiers when key or mode changes
  // Keyed on stable primitives (not the baseIntervals array reference) so
  // borrowed chords — whose intervals are freshly-allocated on every
  // ChordStrip render — don't have their locked/temp modifiers wiped out.
  useEffect(() => {
    setLockedModifiers(new Set());
    setTempModifier(null);
    setCurrentIntervals(baseIntervals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyRoot, mode, numeral]);

  // Get display name based on current modifiers
  const chordName =
    activeModifiers.size > 0
      ? getChordDisplayName(rootNote, baseType, baseIntervals, activeModifiers)
      : getFullChordName(rootNote, baseIntervals);

  // Check if this chord is currently selected on the main piano
  const isSelected =
    state.selectedChords.length > 0 &&
    state.selectedChords[0].rootNote === rootNote &&
    state.selectedChords[0].numeral === numeral;

  // Play the chord with given intervals
  const playChord = useCallback(
    (intervals: number[]) => {
      try {
        const frequencies = getChordFrequencies(rootNote, intervals);
        if (frequencies && frequencies.length > 0) {
          audio.playChord(frequencies, 0.8);
        }
      } catch (error) {
        console.error('Error playing chord:', error);
      }

      // Update main piano selection
      actions.selectChord(rootNote, intervals, numeral);
    },
    [rootNote, numeral, audio, actions]
  );

  // Handle clicking the main chord area (header/preview)
  const handleChordClick = () => {
    playChord(currentIntervals);
  };

  // Long-press detection refs
  const pressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);
  const currentModifierRef = useRef<string | null>(null);

  // Calculate intervals from a set of modifiers
  // Applies replacement modifiers first, then additive modifiers on top
  const calculateIntervals = useCallback(
    (modifiers: Set<string>): number[] => {
      // Find replacement modifier (sus2, sus4, dim, aug) - should be at most one due to conflicts
      let intervals = [...baseIntervals];
      const additiveMods: typeof CHORD_MODIFIERS = [];

      modifiers.forEach((modLabel) => {
        const mod = CHORD_MODIFIERS.find((m) => m.label === modLabel);
        if (!mod) return;

        if (mod.replaceWith) {
          // Replacement modifier - use its intervals as the base
          intervals = [...mod.replaceWith];
        } else {
          // Additive modifier - collect for later
          additiveMods.push(mod);
        }
      });

      // Apply additive modifiers on top of the base
      additiveMods.forEach((mod) => {
        if (mod.intervalsToAdd) {
          mod.intervalsToAdd.forEach((interval) => {
            if (!intervals.includes(interval)) {
              intervals.push(interval);
            }
          });
        } else if (mod.intervalToAdd !== undefined) {
          if (!intervals.includes(mod.intervalToAdd)) {
            intervals.push(mod.intervalToAdd);
          }
        } else if (mod.intervalToRemove !== undefined) {
          intervals = intervals.filter((i) => i !== mod.intervalToRemove);
        }
      });

      return intervals.sort((a, b) => a - b);
    },
    [baseIntervals]
  );

  // Tap handler: toggle temp modifier or preview locked combination
  const handleTap = useCallback(
    (modifierLabel: string) => {
      // If tapping the current temp modifier, toggle it off
      if (tempModifier === modifierLabel) {
        setTempModifier(null);
        // Play just the locked modifiers (or base chord if none)
        const newIntervals = calculateIntervals(lockedModifiers);
        setCurrentIntervals(newIntervals);
        playChord(newIntervals);
        return;
      }

      // If tapping a locked modifier, just play the current combination
      if (lockedModifiers.has(modifierLabel)) {
        playChord(currentIntervals);
        return;
      }

      // Otherwise, set as temp modifier and play
      setTempModifier(modifierLabel);
      const newActive = new Set(lockedModifiers);
      newActive.add(modifierLabel);
      const newIntervals = calculateIntervals(newActive);
      setCurrentIntervals(newIntervals);
      playChord(newIntervals);
    },
    [tempModifier, lockedModifiers, currentIntervals, calculateIntervals, playChord]
  );

  // Long-press handler: toggle lock status
  const handleLongPress = useCallback(
    (modifierLabel: string) => {
      const newLocked = new Set(lockedModifiers);

      if (newLocked.has(modifierLabel)) {
        // Unlock
        newLocked.delete(modifierLabel);
      } else {
        // Lock: resolve conflicts first
        const conflicts = getConflictingModifiers(modifierLabel, newLocked);
        conflicts.forEach((m) => newLocked.delete(m));
        newLocked.add(modifierLabel);
      }

      setLockedModifiers(newLocked);

      // Clear temp if it's now redundant (locked) or conflicts
      let newTemp = tempModifier;
      if (tempModifier) {
        if (newLocked.has(tempModifier)) {
          // Temp is now locked, no need for temp
          newTemp = null;
        } else {
          // Check if temp conflicts with new locked set
          const tempConflicts = getConflictingModifiers(tempModifier, newLocked);
          if (tempConflicts.length > 0) {
            newTemp = null;
          }
        }
        setTempModifier(newTemp);
      }

      // Calculate and play
      const newActive = new Set(newLocked);
      if (newTemp) newActive.add(newTemp);
      const newIntervals = calculateIntervals(newActive);
      setCurrentIntervals(newIntervals);
      playChord(newIntervals);
    },
    [lockedModifiers, tempModifier, calculateIntervals, playChord]
  );

  // Pointer event handlers for long-press detection
  const handlePointerDown = useCallback(
    (modifierLabel: string) => {
      isLongPressRef.current = false;
      currentModifierRef.current = modifierLabel;

      pressTimerRef.current = window.setTimeout(() => {
        isLongPressRef.current = true;
        handleLongPress(modifierLabel);
      }, LONG_PRESS_MS);
    },
    [handleLongPress]
  );

  const handlePointerUp = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    // If it wasn't a long press, treat as tap
    if (!isLongPressRef.current && currentModifierRef.current) {
      handleTap(currentModifierRef.current);
    }

    currentModifierRef.current = null;
  }, [handleTap]);

  const handlePointerLeave = useCallback(() => {
    // Cancel long-press if pointer leaves the button
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    currentModifierRef.current = null;
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  // Piano preview component with scale degree numbers
  const PianoPreview = () => {
    if (!showPreview) return null;

    const whiteKeyPositions = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    const blackKeyPositions = [
      { key: 1, x: 11 }, // C#
      { key: 3, x: 25 }, // D#
      { key: 6, x: 53 }, // F#
      { key: 8, x: 67 }, // G#
      { key: 10, x: 81 }, // A#
    ];

    const rootIndex = NOTES.indexOf(rootNote);

    // Map intervals to chromatic positions
    const activeKeys = new Map<number, number>();
    currentIntervals.forEach((interval) => {
      const chromaticPosition = (rootIndex + interval) % 12;
      activeKeys.set(chromaticPosition, interval);
    });

    const isNoteActive = (chromaticKey: number) => activeKeys.has(chromaticKey);

    const getNoteLabel = (chromaticKey: number): string | null => {
      if (!activeKeys.has(chromaticKey)) return null;
      return getScaleDegreeLabel(chromaticKey, keyRoot, mode);
    };

    return (
      <svg viewBox="-1 -1 100 42" className="chord-card-piano">
        {/* White Keys */}
        {whiteKeyPositions.map((keyNum, idx) => {
          const active = isNoteActive(keyNum);
          const label = getNoteLabel(keyNum);
          const x = idx * 14;

          return (
            <g key={keyNum}>
              <rect
                x={x}
                y="0"
                width="13"
                height="24"
                rx="1"
                className={`chord-card-white-key ${active ? 'active' : ''}`}
              />
              {label && (
                <text
                  x={x + 6.5}
                  y="36"
                  className="chord-card-key-label"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Black Keys */}
        {blackKeyPositions.map(({ key, x }) => {
          const active = isNoteActive(key);
          const label = getNoteLabel(key);

          return (
            <g key={key}>
              <rect
                x={x}
                y="0"
                width="8"
                height="15"
                rx="1"
                className={`chord-card-black-key ${active ? 'active' : ''}`}
              />
              {label && (
                <text
                  x={x + 4}
                  y="36"
                  className="chord-card-key-label"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className={`chord-card ${isDiatonic ? 'diatonic' : 'borrowed'} ${isSelected ? 'selected' : ''}`}
    >
      {/* Clickable header area */}
      <button
        className="chord-card-header"
        onClick={handleChordClick}
        type="button"
      >
        <div className="chord-card-numeral">{numeral}</div>
        <div className="chord-card-name">{chordName}</div>
        <PianoPreview />
      </button>

      {/* Modifier buttons grid */}
      <div className="chord-card-modifiers">
        {CHORD_MODIFIERS.map((modifier) => {
          const isActive = activeModifiers.has(modifier.label);
          const isLocked = lockedModifiers.has(modifier.label);
          return (
            <button
              key={modifier.label}
              className={`chord-card-modifier-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onPointerDown={() => handlePointerDown(modifier.label)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onPointerCancel={handlePointerLeave}
              title={isLocked ? `${modifier.label} (locked)` : modifier.label}
              type="button"
            >
              {modifier.label}
              {isLocked && <span className="chord-card-modifier-lock-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
