import { useState, useCallback, useRef, type MouseEvent, type TouchEvent } from 'react';
import type { PianoKeyData } from '../utils/pianoUtils';
import { getScaleDegreeNumeral } from '../utils/musicTheory';
import type { Note } from '../types/music';
import './PianoKey.css';

interface PianoKeyProps {
  keyData: PianoKeyData;
  onPress: (frequency: number) => void;
  isInScale: boolean;
  isInChord: boolean;
  showScaleHighlighting?: boolean; // Whether scale toggle is ON (dims non-scale keys)
  showScaleDegree?: boolean;
  selectedKey: Note;
  mode: 'major' | 'minor';
  showScaleLabels?: boolean; // Show labels even without background highlighting
  isGlissandoActive?: boolean; // Whether glissando mode is active (mouse down or touch)
  isMidiActive?: boolean; // Whether this key is currently pressed via MIDI
}

export function PianoKey({
  keyData,
  onPress,
  isInScale,
  isInChord,
  showScaleHighlighting = false,
  showScaleDegree,
  selectedKey,
  mode,
  showScaleLabels = false,
  isGlissandoActive = false,
  isMidiActive = false,
}: PianoKeyProps) {
  // Separate mouse and touch tracking for correct multi-touch behavior
  const [isMousePressed, setIsMousePressed] = useState(false);

  // Use ref for touch IDs (avoids re-render on every touch change)
  // State tracks whether any touches are active (for re-rendering)
  const activeTouchesRef = useRef<Set<number>>(new Set());
  const [hasTouches, setHasTouches] = useState(false);

  // Combined pressed state for visual feedback
  const isPressed = isMousePressed || hasTouches;

  // Play the note
  const playNote = useCallback(() => {
    onPress(keyData.frequency);
  }, [keyData.frequency, onPress]);

  // ===== Mouse Handlers =====

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setIsMousePressed(true);
      playNote();
    },
    [playNote]
  );

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsMousePressed(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Play note when mouse enters while dragging (glissando)
    if (isGlissandoActive && !isMousePressed) {
      setIsMousePressed(true);
      playNote();
    }
  }, [isGlissandoActive, isMousePressed, playNote]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsMousePressed(false);
  }, []);

  // ===== Touch Handlers =====
  // Properly handles multi-touch: tracks each touch by ID

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();

      const wasEmpty = activeTouchesRef.current.size === 0;

      // Add all touches that started on this key
      // changedTouches contains ONLY the touches that triggered this event
      for (let i = 0; i < e.changedTouches.length; i++) {
        activeTouchesRef.current.add(e.changedTouches[i].identifier);
      }

      // Update state for re-render
      setHasTouches(true);

      // Play sound only on first touch (not additional fingers on same key)
      if (wasEmpty) {
        playNote();
      }
    },
    [playNote]
  );

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();

    // Remove all touches that ended
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouchesRef.current.delete(e.changedTouches[i].identifier);
    }

    // Only update state when all touches have ended
    if (activeTouchesRef.current.size === 0) {
      setHasTouches(false);
    }
  }, []);

  const handleTouchCancel = useCallback((e: TouchEvent) => {
    e.preventDefault();

    // Remove all cancelled touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouchesRef.current.delete(e.changedTouches[i].identifier);
    }

    if (activeTouchesRef.current.size === 0) {
      setHasTouches(false);
    }
  }, []);

  // Get scale degree numeral if in scale OR if showing labels
  const scaleDegree =
    isInScale || showScaleLabels
      ? getScaleDegreeNumeral(keyData.baseNote, selectedKey, mode)
      : null;

  // Calculate position
  // White keys: positioned at their index
  // Black keys: positioned between white keys (65% into the left white key)
  const leftPosition = keyData.isBlack
    ? `calc(${keyData.whiteKeyIndex} * var(--white-key-width) + var(--white-key-width) * 0.65)`
    : `calc(${keyData.whiteKeyIndex} * var(--white-key-width))`;

  // Determine CSS classes
  // - in-chord: orange highlighting (takes priority)
  // - not-in-scale: dimmed (only when scale toggle is ON and key is NOT in scale AND NOT in chord)
  const notInScale = showScaleHighlighting && !isInScale && !isInChord;

  return (
    <div
      className={`piano-key ${keyData.isBlack ? 'black' : 'white'} ${isPressed || isMidiActive ? 'pressed' : ''} ${
        isInChord ? 'in-chord' : ''
      } ${notInScale ? 'not-in-scale' : ''} ${isMidiActive ? 'midi-active' : ''}`}
      style={{ left: leftPosition }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      role="button"
      tabIndex={0}
      aria-label={`${keyData.note}`}
    >
      <div className="key-label">
        <span className="note-name">{keyData.baseNote}</span>
        {showScaleDegree && scaleDegree && <span className="scale-degree">{scaleDegree}</span>}
      </div>
    </div>
  );
}
