import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useMusicState, useMusicActions } from '../hooks/useMusic';
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
import type { ModifierLabel } from '../types/chords';
import './ChordCard.css';

const LONG_PRESS_MS = 400;

interface PianoPreviewProps {
  rootNote: Note;
  currentIntervals: number[];
  keyRoot: Note;
  mode: Mode;
}

// Piano preview component with scale degree numbers. Hoisted to module scope
// (and memoized) so its identity is stable across ChordCard renders — an
// inline component definition would get a new identity every render, forcing
// React to unmount/remount the whole SVG subtree.
const PianoPreview = memo(function PianoPreview({
  rootNote,
  currentIntervals,
  keyRoot,
  mode,
}: PianoPreviewProps) {
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
});

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
  const { state } = useMusicState();
  const { audio, actions } = useMusicActions();

  // Locked modifiers persist until explicitly unlocked via long-press
  const [lockedModifiers, setLockedModifiers] = useState<Set<ModifierLabel>>(new Set());
  // Temp modifier is selected via tap, can be toggled off by tapping again
  const [tempModifier, setTempModifier] = useState<ModifierLabel | null>(null);
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
  const currentModifierRef = useRef<ModifierLabel | null>(null);

  // Calculate intervals from a set of modifiers
  // Applies replacement modifiers first, then additive modifiers on top
  const calculateIntervals = useCallback(
    (modifiers: Set<ModifierLabel>): number[] => {
      // Find replacement modifier (sus2, sus4, dim, aug) - should be at most one due to conflicts
      let intervals = [...baseIntervals];
      const additiveMods: typeof CHORD_MODIFIERS = [];

      modifiers.forEach((modLabel) => {
        const mod = CHORD_MODIFIERS.find((m) => m.label === modLabel);
        if (!mod) return;

        if (mod.kind === 'replace') {
          // Replacement modifier - use its intervals as the base
          intervals = [...mod.intervals];
        } else {
          // Additive modifier (addOne / addMany) - collect for later
          additiveMods.push(mod);
        }
      });

      // Apply additive modifiers on top of the base
      additiveMods.forEach((mod) => {
        if (mod.kind === 'addMany') {
          mod.intervals.forEach((interval) => {
            if (!intervals.includes(interval)) {
              intervals.push(interval);
            }
          });
        } else if (mod.kind === 'addOne') {
          if (!intervals.includes(mod.interval)) {
            intervals.push(mod.interval);
          }
        }
      });

      return intervals.sort((a, b) => a - b);
    },
    [baseIntervals]
  );

  // Tap handler: toggle temp modifier or preview locked combination
  const handleTap = useCallback(
    (modifierLabel: ModifierLabel) => {
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
    (modifierLabel: ModifierLabel) => {
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
    (modifierLabel: ModifierLabel) => {
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

  // ===== Keyboard Handlers =====
  // Pointer devices drive tap/long-press via the pointer handlers above; the
  // synthetic `click` they emit is ignored (see the button's onClick guard) so
  // they never double-fire. Keyboard users get their own paths here:
  //   - Enter / Space           → tap (handled by the onClick guard below,
  //                               which only runs for keyboard-generated clicks)
  //   - Shift+Enter / Shift+Space → toggle lock, mirroring the pointer long-press
  const handleModifierKeyDown = useCallback(
    (e: KeyboardEvent, modifierLabel: ModifierLabel) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!e.shiftKey) return; // plain Enter/Space falls through to the click → handleTap
      if (e.repeat) return;
      // preventDefault suppresses the synthetic click, so tap doesn't also fire.
      e.preventDefault();
      handleLongPress(modifierLabel);
    },
    [handleLongPress]
  );

  // Tap path for keyboard/AT activation only. A keyboard-generated click reports
  // detail === 0, whereas a pointer/mouse click reports detail >= 1 — those are
  // already handled by handlePointerUp, so we skip them to avoid double-plays.
  const handleModifierClick = useCallback(
    (e: MouseEvent, modifierLabel: ModifierLabel) => {
      if (e.detail !== 0) return;
      handleTap(modifierLabel);
    },
    [handleTap]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

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
        {showPreview && (
          <PianoPreview
            rootNote={rootNote}
            currentIntervals={currentIntervals}
            keyRoot={keyRoot}
            mode={mode}
          />
        )}
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
              onClick={(e) => handleModifierClick(e, modifier.label)}
              onKeyDown={(e) => handleModifierKeyDown(e, modifier.label)}
              aria-pressed={isLocked}
              aria-keyshortcuts="Shift+Enter"
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
